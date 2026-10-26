import { Express, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 2) {
  let lastError: any;
  const originalModel = params.model;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || '');
      const isTemporary =
        errStr.includes('503') ||
        err?.status === 503 ||
        errStr.includes('high demand') ||
        errStr.includes('UNAVAILABLE') ||
        errStr.includes('429');

      if (isTemporary && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        // If on second retry gemini-3.8-flash had a demand spike, fallback to gemini-3.1-flash-lite (if maps is not required)
        if (attempt === 1 && originalModel === 'gemini-3.8-flash' && !params.config?.tools?.some((t: any) => t.googleMaps)) {
          params.model = 'gemini-3.1-flash-lite';
        }
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function parseErrorMessage(err: any): string {
  if (!err) return 'Unknown error occurred.';
  let msg = err.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed.error?.message) {
      msg = parsed.error.message;
    }
  } catch (e) {}
  return msg;
}

export function setupGeminiApi(app: Express) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Multi-turn Chatbot (gemini-3.8-flash, gemini-3.1-flash-lite, gemini-4-argon)
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in your environment.',
        });
      }

      const {
        messages = [],
        model = 'gemini-3.8-flash',
        systemRole = 'default',
        enableSearch = false,
        enableMaps = false,
        userLocation,
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
      }

      const validModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'];
      let targetModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

      let systemInstruction =
        'You are ZeR0 AI, the tactical cybersecurity assistant and SOC advisor for ZeR0CyB3r (Pranshu Verman). ' +
        'Your expertise covers offensive security, ethical hacking, vulnerability assessments (VAPT), SOC triage, ' +
        'CVE research, cloud security, penetration testing, malware analysis, network forensics, and cybersecurity career guidance. ' +
        'Maintain a sharp, technical, and professional demeanor. Use markdown, clear bash/code snippets, and defensive mitigation steps. ' +
        'Never assist in malicious black-hat attacks; always focus on ethical penetration testing, defense-in-depth, and security research.';

      if (systemRole === 'cve_analyst') {
        systemInstruction =
          'You are the ZeR0CyB3r Threat Intelligence & CVE Triage Specialist. Focus on analyzing CVEs, exploit vectors, ' +
          'CVSS severity scores, affected components, proof-of-concept mechanics, and prioritized remediation patches.';
      } else if (systemRole === 'code_auditor') {
        systemInstruction =
          'You are the ZeR0CyB3r Secure Code Auditor and Reverse Engineering Advisor. Audit code snippets for OWASP Top 10 vulnerabilities, ' +
          'buffer overflows, cryptographic weaknesses, and logic bugs with concrete hardened code examples.';
      } else if (systemRole === 'study_mentor') {
        systemInstruction =
          'You are the ZeR0CyB3r Academy Mentor. Guide learners through ethical hacking certifications (CEH, OSCP, CompTIA Security+, CRTP), ' +
          'explain cybersecurity concepts in clear terms, provide study blueprints, and recommend practice labs.';
      }

      const tools: any[] = [];
      let toolConfig: any = undefined;

      if (enableMaps && targetModel === 'gemini-3.8-flash') {
        tools.push({ googleMaps: {} });
        if (
          userLocation &&
          typeof userLocation.latitude === 'number' &&
          typeof userLocation.longitude === 'number'
        ) {
          toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
            },
          };
        }
      } else if (enableSearch) {
        tools.push({ googleSearch: {} });
      }

      const contents = messages.map((m: any) => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.text || m.content || '') }],
      }));

      const config: any = {
        systemInstruction,
      };

      if (tools.length > 0) {
        config.tools = tools;
      }
      if (toolConfig) {
        config.toolConfig = toolConfig;
      }

      const response = await generateContentWithRetry(ai, {
        model: targetModel,
        contents,
        config,
      });

      const replyText = response.text || 'No response generated.';

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks || [];

      const webSources: Array<{ uri: string; title: string }> = [];
      const mapsSources: Array<{ uri: string; title: string }> = [];

      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          webSources.push({
            uri: chunk.web.uri,
            title: chunk.web.title || chunk.web.uri,
          });
        }
        if (chunk.maps?.uri) {
          mapsSources.push({
            uri: chunk.maps.uri,
            title: chunk.maps.title || 'View Location on Google Maps',
          });
        }
      });

      res.json({
        reply: replyText,
        modelUsed: targetModel,
        webSources,
        mapsSources,
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      res.status(500).json({
        error: parseErrorMessage(error) || 'Failed to generate chat response from Gemini API.',
      });
    }
  });

  // 2. Google Search Grounding (gemini-3.8-flash with googleSearch tool)
  app.post('/api/gemini/search', async (req: Request, res: Response) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in your environment.',
        });
      }

      const { query } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'A search query is required.' });
      }

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.8-flash',
        contents: query.trim(),
        config: {
          systemInstruction:
            'You are a real-time cyber threat intelligence analyst and security researcher. ' +
            'Use Google Search grounding to retrieve up-to-date and accurate information on cyber attacks, CVE disclosures, ' +
            'zero-day vulnerabilities, security patches, security tools, and infosec news. ' +
            'Structure your answer with clear bullet points, severity details, and actionable defensive takeaways.',
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const chunks = groundingMetadata?.groundingChunks || [];

      const sources = chunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          uri: c.web.uri,
          title: c.web.title || c.web.uri,
        }));

      res.json({
        answer: text,
        sources,
        searchQueries: groundingMetadata?.webSearchQueries || [],
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/search:', error);
      res.status(500).json({
        error: parseErrorMessage(error) || 'Failed to query Google Search Grounding with Gemini.',
      });
    }
  });

  // 3. Google Maps Grounding (gemini-3.8-flash with googleMaps tool)
  app.post('/api/gemini/maps', async (req: Request, res: Response) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in your environment.',
        });
      }

      const { query, latitude, longitude } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'A location query is required.' });
      }

      const config: any = {
        systemInstruction:
          'You are a cybersecurity geographic coordinator. Help users find authorized cyber testing centers (e.g. Pearson VUE, Prometric), ' +
          'infosec training institutions, hacker spaces, tech hubs, DEF CON / Nullcon chapter meetup venues, and university labs. ' +
          'Always mention the place names and location context clearly in your response.',
        tools: [{ googleMaps: {} }],
      };

      if (typeof latitude === 'number' && typeof longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        };
      }

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.8-flash',
        contents: query.trim(),
        config,
      });

      const text = response.text || '';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const places: Array<{ uri: string; title: string }> = [];
      chunks.forEach((chunk: any) => {
        if (chunk.maps?.uri) {
          places.push({
            uri: chunk.maps.uri,
            title: chunk.maps.title || 'View Place on Google Maps',
          });
        }
      });

      res.json({
        answer: text,
        places,
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/maps:', error);
      res.status(500).json({
        error: parseErrorMessage(error) || 'Failed to query Google Maps Grounding with Gemini.',
      });
    }
  });

  // 4. Audio Transcription (gemini-3.5-transcribe)
  app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in your environment.',
        });
      }

      const { audioBase64, mimeType = 'audio/webm', prompt = 'Transcribe this audio accurately. If it is technical cybersecurity or general speech, preserve domain terms, commands, and CVE numbers accurately.' } = req.body;

      if (!audioBase64 || typeof audioBase64 !== 'string') {
        return res.status(400).json({ error: 'Audio base64 data is required.' });
      }

      const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.+_-]+;base64,/, '');

      const audioPart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            { text: prompt },
          ],
        },
      });

      const transcription = response.text || '';

      res.json({
        transcription: transcription.trim(),
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/transcribe:', error);
      res.status(500).json({
        error: parseErrorMessage(error) || 'Failed to transcribe audio with gemini-3.5-transcribe.',
      });
    }
  });
}
