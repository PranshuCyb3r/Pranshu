/**
 * ZeR0CyB3r // Gemini Tactical AI Sentinel
 * Client Integration: Multi-turn Chat, Search Grounding, Maps Grounding & Audio Transcription
 * Powered by Google Gemini: gemini-3.8-flash, gemini-3.1-flash-lite, gemini-4-argon, gemini-3.5-transcribe
 */

(function () {
  'use strict';

  // State Management
  const state = {
    isOpen: false,
    activeTab: 'chat', // 'chat' | 'search' | 'maps' | 'voice'
    selectedModel: 'gemini-3.8-flash',
    selectedRole: 'default',
    enableSearchGrounding: false,
    enableMapsGrounding: false,
    chatHistory: [],
    isSending: false,
    // Voice recording
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
    recordTimerInterval: null,
    recordSeconds: 0,
    voiceTarget: 'chat', // 'chat' | 'studio'
    lastTranscription: '',
  };

  // Restore stored chat history if available
  try {
    const saved = localStorage.getItem('zer0_ai_chat_history');
    if (saved) {
      state.chatHistory = JSON.parse(saved);
    }
  } catch (e) {
    state.chatHistory = [];
  }

  // Inject UI once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSentinelUI);
  } else {
    initSentinelUI();
  }

  function initSentinelUI() {
    if (document.getElementById('geminiAiSentinelRoot')) return;

    const root = document.createElement('div');
    root.id = 'geminiAiSentinelRoot';
    root.innerHTML = `
      <!-- Floating Trigger Button -->
      <button type="button" class="gemini-floating-trigger" id="btnOpenGeminiSentinel" aria-label="Open ZeR0 AI Sentinel" title="Open ZeR0 AI Tactical Sentinel (Gemini 3.8 / 3.5 / 4)">
        <i class="fa-solid fa-microchip gemini-trigger-icon" aria-hidden="true"></i>
        <span>ZeR0 AI SENTINEL</span>
        <span class="gemini-trigger-badge">
        </span>
      </button>

      <!-- Terminal Modal Overlay -->
      <div class="gemini-modal-overlay" id="geminiModalOverlay" role="dialog" aria-modal="true" aria-labelledby="geminiHeaderTitle">
        <div class="gemini-terminal-card" id="geminiTerminalCard">
          
          <!-- Header Bar -->
          <div class="gemini-terminal-header">
            <div class="gemini-header-brand">
              <div class="gemini-header-dots">
                <span class="gemini-h-dot red"></span>
                <span class="gemini-h-dot yellow"></span>
                <span class="gemini-h-dot green"></span>
              </div>
              <div class="gemini-header-title" id="geminiHeaderTitle">
                // ZeR0 AI <span>TACTICAL SENTINEL</span>
              </div>
            </div>

            <div class="gemini-header-actions">
              <span class="gemini-header-status">
                <i class="fa-solid fa-shield-halved"></i> 256-BIT SECURE // GEMINI 3.8
              </span>
              <button type="button" class="gemini-action-btn" id="btnCloseGeminiModal" aria-label="Close Sentinel">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <!-- Navigation Tabs Bar -->
          <div class="gemini-tabs-bar" role="tablist">
            <button type="button" class="gemini-tab-btn active" data-tab="chat" role="tab" aria-selected="true">
              <i class="fa-solid fa-comments"></i>
              <span>Tactical Chat</span>
              <span class="gemini-tab-badge">Multi-Turn</span>
            </button>
            <button type="button" class="gemini-tab-btn" data-tab="search" role="tab" aria-selected="false">
              <i class="fa-brands fa-google"></i>
              <span>Threat Intel Search</span>
              <span class="gemini-tab-badge">Search Grounding</span>
            </button>
            <button type="button" class="gemini-tab-btn" data-tab="maps" role="tab" aria-selected="false">
              <i class="fa-solid fa-location-dot"></i>
              <span>Testing Labs Radar</span>
              <span class="gemini-tab-badge">Maps Grounding</span>
            </button>
            <button type="button" class="gemini-tab-btn" data-tab="voice" role="tab" aria-selected="false">
              <i class="fa-solid fa-microphone-lines"></i>
              <span>Audio Transcribe</span>
              <span class="gemini-tab-badge">Gemini 3.5</span>
            </button>
          </div>

          <!-- Panes Container -->
          <div class="gemini-views-container">

            <!-- ============================================================
                 TAB 1: MULTI-TURN AI CHAT
                 ============================================================ -->
            <div class="gemini-view-pane active" id="paneChat">
              
              <!-- Top Controls: Role & Model Selector & Grounding Toggles -->
              <div class="gemini-chat-top-controls">
                <div class="gemini-ctrl-group">
                  <label for="geminiRoleSelect" style="color: #94a3b8;">// ROLE:</label>
                  <select id="geminiRoleSelect" class="gemini-select-pill" title="Select AI Persona">
                    <option value="default">Tactical SOC Advisor (General)</option>
                    <option value="cve_analyst">Threat Intel & CVE Analyst</option>
                    <option value="code_auditor">Secure Code Auditor</option>
                    <option value="study_mentor">Cyber Academy Study Mentor</option>
                  </select>
                </div>

                <div class="gemini-ctrl-group">
                  <label for="geminiModelSelect" style="color: #94a3b8;">// MODEL:</label>
                  <select id="geminiModelSelect" class="gemini-select-pill" title="Select Gemini Model">
                    <option value="gemini-3.8-flash">gemini-3.8-flash (General • Default)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
                    <option value="gemini-4-argon">gemini-4-argon (Complex Reasoning)</option>
                  </select>
                </div>

                <div class="gemini-ctrl-group">
                  <button type="button" class="gemini-tool-chip" id="toggleSearchGrounding" title="Enable real-time Google Search data in chat">
                    <i class="fa-brands fa-google"></i>
                    <span>Search Grounding</span>
                  </button>
                  <button type="button" class="gemini-tool-chip" id="toggleMapsGrounding" title="Enable Google Maps data in chat">
                    <i class="fa-solid fa-map-location-dot"></i>
                    <span>Maps Grounding</span>
                  </button>
                  <button type="button" class="gemini-tool-chip" id="btnClearChat" title="Clear chat conversation history" style="margin-left: auto;">
                    <i class="fa-solid fa-trash-can"></i>
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <!-- Chat Messages Thread -->
              <div class="gemini-chat-thread" id="geminiChatThread">
                <!-- Dynamically rendered messages -->
              </div>

              <!-- Quick Prompt Suggestions Chips -->
              <div class="gemini-quick-prompts">
                <button type="button" class="gemini-quick-chip" data-prompt="Analyze the most critical zero-day CVE advisories and active exploits this week.">
                  <i class="fa-solid fa-fire text-crimson"></i> Latest Zero-Days
                </button>
                <button type="button" class="gemini-quick-chip" data-prompt="Explain SQL injection prevention with concrete secure parameterized code in Python & Node.js.">
                  <i class="fa-solid fa-code"></i> Secure Code Fix
                </button>
                <button type="button" class="gemini-quick-chip" data-prompt="What are authorized Pearson VUE cybersecurity certification testing centers near me?">
                  <i class="fa-solid fa-map-pin text-crimson"></i> Test Centers
                </button>
                <button type="button" class="gemini-quick-chip" data-prompt="Provide a step-by-step roadmap to crack CompTIA Security+, CEH, and OSCP in 6 months.">
                  <i class="fa-solid fa-graduation-cap"></i> Cert Roadmap
                </button>
              </div>

              <!-- Input Area with Mic & Send -->
              <div class="gemini-chat-input-bar">
                <textarea 
                  id="geminiChatInput" 
                  class="gemini-chat-textarea" 
                  placeholder="Ask ZeR0 AI anything (cybersecurity, CVEs, tools, or press Mic to speak)..."
                  rows="1"
                ></textarea>

                <button type="button" class="gemini-btn-icon gemini-mic-btn" id="btnChatMic" title="Voice Input: Speak to transcribe with Gemini 3.5 Transcribe">
                  <i class="fa-solid fa-microphone"></i>
                </button>

                <button type="button" class="gemini-btn-icon gemini-send-btn" id="btnChatSend" title="Transmit to Gemini (Enter)">
                  <i class="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>

            <!-- ============================================================
                 TAB 2: GOOGLE SEARCH GROUNDING RADAR
                 ============================================================ -->
            <div class="gemini-view-pane" id="paneSearch">
              <div class="gemini-pane-content">
                <div class="gemini-pane-hero">
                  <div class="gemini-pane-hero-title">
                    <i class="fa-brands fa-google text-crimson"></i>
                    <span>Google Search Grounded Threat Intelligence</span>
                  </div>
                  <p class="gemini-pane-hero-desc">
                    Retrieves real-time, verified cyber intelligence, zero-day CVE announcements, and active security advisories powered by <strong>gemini-3.8-flash</strong> with live Google Search citations.
                  </p>
                </div>

                <div class="gemini-query-input-wrap">
                  <input type="text" id="geminiSearchInput" class="gemini-query-input" placeholder="Search live CVEs, vendor patches, ransomware IOCs, or threat actors..." />
                  <button type="button" class="gemini-query-btn" id="btnExecuteSearch">
                    <i class="fa-solid fa-satellite-dish"></i>
                    <span>EXECUTE RADAR</span>
                  </button>
                </div>

                <div class="gemini-preset-chips-wrap">
                  <span style="font-family: var(--font-mono); font-size: 11px; color: #64748b; align-self: center;">QUICK RADAR:</span>
                  <button type="button" class="gemini-preset-chip" data-search="Active ransomware campaigns and zero-day vulnerabilities reported this week">
                    Ransomware & 0-Days
                  </button>
                  <button type="button" class="gemini-preset-chip" data-search="Latest critical CVEs affecting Linux Kernel and OpenSSH">
                    Linux / OpenSSH CVEs
                  </button>
                  <button type="button" class="gemini-preset-chip" data-search="Recent Microsoft Windows Remote Code Execution patches">
                    Windows RCE Patches
                  </button>
                  <button type="button" class="gemini-preset-chip" data-search="CISA Known Exploited Vulnerabilities catalog updates">
                    CISA KEV Catalog
                  </button>
                </div>

                <div class="gemini-results-box" id="geminiSearchResultsBox">
                  <span style="color: #64748b; font-family: var(--font-mono); font-size: 12px;">
                    // Enter a query above or click a quick radar chip to pull real-time threat intelligence with live Google Search source citations.
                  </span>
                </div>
              </div>
            </div>

            <!-- ============================================================
                 TAB 3: GOOGLE MAPS GROUNDING RADAR
                 ============================================================ -->
            <div class="gemini-view-pane" id="paneMaps">
              <div class="gemini-pane-content">
                <div class="gemini-pane-hero">
                  <div class="gemini-pane-hero-title">
                    <i class="fa-solid fa-location-dot text-crimson"></i>
                    <span>Google Maps Grounded Testing Labs & Hubs Locator</span>
                  </div>
                  <p class="gemini-pane-hero-desc">
                    Locate authorized cybersecurity test centers (Pearson VUE, Prometric), DEF CON / Nullcon chapter meetup venues, hacker spaces, and forensic labs powered by <strong>gemini-3.8-flash</strong> with direct Google Maps place links.
                  </p>
                </div>

                <div class="gemini-query-input-wrap">
                  <input type="text" id="geminiMapsInput" class="gemini-query-input" placeholder="Find Pearson VUE exam centers, cyber labs, or tech hubs near me / in city..." />
                  <button type="button" class="gemini-query-btn" id="btnExecuteMaps">
                    <i class="fa-solid fa-compass"></i>
                    <span>LOCATE ON MAPS</span>
                  </button>
                </div>

                <div class="gemini-preset-chips-wrap">
                  <span style="font-family: var(--font-mono); font-size: 11px; color: #64748b; align-self: center;">QUICK RADAR:</span>
                  <button type="button" class="gemini-preset-chip" data-maps="Authorized Pearson VUE certification testing centers for CompTIA and CEH exams">
                    Pearson VUE Centers
                  </button>
                  <button type="button" class="gemini-preset-chip" data-maps="Cybersecurity training institutes and ethical hacking academies nearby">
                    Ethical Hacking Academies
                  </button>
                  <button type="button" class="gemini-preset-chip" data-maps="Computer forensics and cyber defense research laboratories">
                    Forensics Research Labs
                  </button>
                  <button type="button" class="gemini-preset-chip" data-maps="Hacker spaces, maker spaces, and tech community hubs">
                    Hacker Spaces & Hubs
                  </button>
                </div>

                <div class="gemini-results-box" id="geminiMapsResultsBox">
                  <span style="color: #64748b; font-family: var(--font-mono); font-size: 12px;">
                    // Enter a location query above to discover authorized facilities with direct Google Maps clickable links and directions.
                  </span>
                </div>
              </div>
            </div>

            <!-- ============================================================
                 TAB 4: AUDIO TRANSCRIPTION STUDIO
                 ============================================================ -->
            <div class="gemini-view-pane" id="paneVoice">
              <div class="gemini-pane-content">
                <div class="gemini-pane-hero">
                  <div class="gemini-pane-hero-title">
                    <i class="fa-solid fa-microphone-lines text-crimson"></i>
                    <span>Voice Input & Audio Transcription Studio</span>
                  </div>
                  <p class="gemini-pane-hero-desc">
                    Record audio via your microphone or upload audio files to transcribe spoken speech into text using <strong>gemini-3.5-transcribe</strong>.
                  </p>
                </div>

                <div class="gemini-audio-record-box">
                  <button type="button" class="gemini-big-mic-btn" id="btnBigRecordMic" title="Click to start/stop recording">
                    <i class="fa-solid fa-microphone"></i>
                  </button>

                  <div class="gemini-timer-display" id="geminiRecordTimerDisplay">00:00</div>
                  <div id="geminiRecordStatusText" style="font-family: var(--font-mono); font-size: 12px; color: #94a3b8;">
                    Click microphone above to start recording your voice
                  </div>

                  <div style="margin-top: 10px; display: flex; align-items: center; gap: 12px;">
                    <label class="gemini-tool-chip" style="cursor: pointer;">
                      <i class="fa-solid fa-file-audio"></i>
                      <span>Upload Audio File (MP3, WAV, WEBM)</span>
                      <input type="file" id="geminiAudioFileInput" accept="audio/*" style="display: none;" />
                    </label>
                  </div>
                </div>

                <!-- Transcription Result -->
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #fff;">
                      // TRANSCRIPTION RESULT (GEMINI 3.5 TRANSCRIBE):
                    </span>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="gemini-tool-chip" id="btnCopyTranscription" title="Copy transcription to clipboard">
                        <i class="fa-regular fa-copy"></i> Copy
                      </button>
                      <button type="button" class="gemini-tool-chip" id="btnSendTranscribeToChat" title="Send to Tactical AI Chat">
                        <i class="fa-solid fa-comments"></i> Send to Chat
                      </button>
                    </div>
                  </div>

                  <div class="gemini-results-box" id="geminiTranscribeResultBox">
                    <span style="color: #64748b; font-family: var(--font-mono); font-size: 12px;">
                      // Your transcribed speech or uploaded audio text will appear here.
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    attachEventListeners();
    renderChatHistory();
  }

  function attachEventListeners() {
    // Open / Close Modal
    const btnOpen = document.getElementById('btnOpenGeminiSentinel');
    const btnClose = document.getElementById('btnCloseGeminiModal');
    const overlay = document.getElementById('geminiModalOverlay');

    if (btnOpen) btnOpen.addEventListener('click', () => openSentinel('chat'));
    if (btnClose) btnClose.addEventListener('click', closeSentinel);

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSentinel();
      });
    }

    // Keyboard Shortcut (Alt + K or Escape)
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (state.isOpen) closeSentinel();
        else openSentinel();
      } else if (e.key === 'Escape' && state.isOpen) {
        closeSentinel();
      }
    });

    // Tab Navigation Switcher
    const tabBtns = document.querySelectorAll('.gemini-tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        switchTab(target);
      });
    });

    // Chat Controls
    const roleSelect = document.getElementById('geminiRoleSelect');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        state.selectedRole = e.target.value;
      });
    }

    const modelSelect = document.getElementById('geminiModelSelect');
    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        state.selectedModel = e.target.value;
      });
    }

    const toggleSearch = document.getElementById('toggleSearchGrounding');
    if (toggleSearch) {
      toggleSearch.addEventListener('click', () => {
        state.enableSearchGrounding = !state.enableSearchGrounding;
        if (state.enableSearchGrounding) {
          state.enableMapsGrounding = false;
          const toggleMaps = document.getElementById('toggleMapsGrounding');
          if (toggleMaps) toggleMaps.classList.remove('maps-active');
        }
        toggleSearch.classList.toggle('active', state.enableSearchGrounding);
      });
    }

    const toggleMaps = document.getElementById('toggleMapsGrounding');
    if (toggleMaps) {
      toggleMaps.addEventListener('click', () => {
        state.enableMapsGrounding = !state.enableMapsGrounding;
        if (state.enableMapsGrounding) {
          state.enableSearchGrounding = false;
          const toggleSearchEl = document.getElementById('toggleSearchGrounding');
          if (toggleSearchEl) toggleSearchEl.classList.remove('active');
        }
        toggleMaps.classList.toggle('maps-active', state.enableMapsGrounding);
      });
    }

    const btnClearChat = document.getElementById('btnClearChat');
    if (btnClearChat) {
      btnClearChat.addEventListener('click', () => {
        if (confirm('Clear current tactical chat history?')) {
          state.chatHistory = [];
          try {
            localStorage.removeItem('zer0_ai_chat_history');
          } catch (e) {}
          renderChatHistory();
        }
      });
    }

    // Chat Send & Input
    const chatInput = document.getElementById('geminiChatInput');
    const btnSend = document.getElementById('btnChatSend');

    if (btnSend && chatInput) {
      btnSend.addEventListener('click', handleChatSubmit);
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleChatSubmit();
        }
      });

      // Auto resize textarea
      chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
      });
    }

    // Quick Prompts
    const quickChips = document.querySelectorAll('.gemini-quick-chip');
    quickChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (chatInput && prompt) {
          chatInput.value = prompt;
          chatInput.focus();
        }
      });
    });

    // Chat Microphone Button
    const btnChatMic = document.getElementById('btnChatMic');
    if (btnChatMic) {
      btnChatMic.addEventListener('click', () => {
        state.voiceTarget = 'chat';
        toggleAudioRecording(btnChatMic);
      });
    }

    // TAB 2: Search Grounding
    const btnExecuteSearch = document.getElementById('btnExecuteSearch');
    const searchInput = document.getElementById('geminiSearchInput');
    if (btnExecuteSearch && searchInput) {
      btnExecuteSearch.addEventListener('click', () => executeSearchGrounding(searchInput.value));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          executeSearchGrounding(searchInput.value);
        }
      });
    }

    const searchChips = document.querySelectorAll('#paneSearch .gemini-preset-chip');
    searchChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-search');
        if (searchInput && q) {
          searchInput.value = q;
          executeSearchGrounding(q);
        }
      });
    });

    // TAB 3: Maps Grounding
    const btnExecuteMaps = document.getElementById('btnExecuteMaps');
    const mapsInput = document.getElementById('geminiMapsInput');
    if (btnExecuteMaps && mapsInput) {
      btnExecuteMaps.addEventListener('click', () => executeMapsGrounding(mapsInput.value));
      mapsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          executeMapsGrounding(mapsInput.value);
        }
      });
    }

    const mapsChips = document.querySelectorAll('#paneMaps .gemini-preset-chip');
    mapsChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-maps');
        if (mapsInput && q) {
          mapsInput.value = q;
          executeMapsGrounding(q);
        }
      });
    });

    // TAB 4: Voice Studio
    const btnBigRecord = document.getElementById('btnBigRecordMic');
    if (btnBigRecord) {
      btnBigRecord.addEventListener('click', () => {
        state.voiceTarget = 'studio';
        toggleAudioRecording(btnBigRecord);
      });
    }

    const fileInput = document.getElementById('geminiAudioFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', handleAudioFileUpload);
    }

    const btnCopy = document.getElementById('btnCopyTranscription');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (state.lastTranscription) {
          navigator.clipboard.writeText(state.lastTranscription);
          const orig = btnCopy.innerHTML;
          btnCopy.innerHTML = '<i class="fa-solid fa-check text-crimson"></i> Copied!';
          setTimeout(() => (btnCopy.innerHTML = orig), 2000);
        }
      });
    }

    const btnSendToChat = document.getElementById('btnSendTranscribeToChat');
    if (btnSendToChat) {
      btnSendToChat.addEventListener('click', () => {
        if (state.lastTranscription) {
          switchTab('chat');
          if (chatInput) {
            chatInput.value = state.lastTranscription;
            chatInput.focus();
          }
        }
      });
    }
  }

  function openSentinel(tabName) {
    state.isOpen = true;
    const overlay = document.getElementById('geminiModalOverlay');
    if (overlay) overlay.classList.add('active');
    if (tabName) switchTab(tabName);
    document.body.style.overflow = 'hidden';

    // Focus input
    setTimeout(() => {
      const input = document.getElementById('geminiChatInput');
      if (input && state.activeTab === 'chat') input.focus();
    }, 200);
  }

  function closeSentinel() {
    state.isOpen = false;
    const overlay = document.getElementById('geminiModalOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';

    // Stop recording if active
    if (state.isRecording) {
      stopAudioRecording();
    }
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    const tabBtns = document.querySelectorAll('.gemini-tab-btn');
    const panes = document.querySelectorAll('.gemini-view-pane');

    tabBtns.forEach((btn) => {
      const isTarget = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    panes.forEach((p) => {
      const match =
        (tabName === 'chat' && p.id === 'paneChat') ||
        (tabName === 'search' && p.id === 'paneSearch') ||
        (tabName === 'maps' && p.id === 'paneMaps') ||
        (tabName === 'voice' && p.id === 'paneVoice');
      p.classList.toggle('active', match);
    });
  }

  // ==========================================================================
  // TAB 1: MULTI-TURN CHAT HANDLERS
  // ==========================================================================
  function renderChatHistory() {
    const thread = document.getElementById('geminiChatThread');
    if (!thread) return;

    if (state.chatHistory.length === 0) {
      thread.innerHTML = `
        <div class="gemini-msg model">
          <div class="gemini-msg-avatar">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div class="gemini-msg-bubble">
            <div class="gemini-msg-meta">
              <span>// ZeR0 AI SENTINEL</span>
              <span>TACTICAL ADVISOR</span>
            </div>
            <div class="gemini-msg-body">
              Greetings, Operator. I am <strong>ZeR0 AI</strong>, your tactical cyber defense companion and infosec analyst.<br><br>
              I can assist you with:
              <ul style="margin: 8px 0 8px 18px; line-height: 1.6;">
                <li>Ethical hacking, pentesting methodology, and tool commands</li>
                <li>Live CVE analysis with <strong>Google Search Grounding</strong></li>
                <li>Pearson VUE & training lab locations with <strong>Google Maps Grounding</strong></li>
                <li>Voice queries using <strong>Gemini 3.5 Transcribe</strong></li>
              </ul>
              Select a model or persona above, or ask any question to begin.
            </div>
          </div>
        </div>
      `;
      return;
    }

    let html = '';
    state.chatHistory.forEach((msg, idx) => {
      const isUser = msg.role === 'user';
      const timeStr = msg.timestamp || '';

      let citationsHtml = '';
      if (!isUser && ((msg.webSources && msg.webSources.length > 0) || (msg.mapsSources && msg.mapsSources.length > 0))) {
        citationsHtml += `<div class="gemini-msg-citations">`;
        if (msg.webSources && msg.webSources.length > 0) {
          citationsHtml += `<div class="gemini-citations-header"><i class="fa-brands fa-google text-crimson"></i> Google Search Citations:</div>`;
          msg.webSources.forEach((src) => {
            citationsHtml += `
              <a href="${escapeHtml(src.uri)}" target="_blank" rel="noopener noreferrer" class="gemini-citation-chip" title="${escapeHtml(src.title)}">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                <span>${escapeHtml(src.title)}</span>
              </a>
            `;
          });
        }
        if (msg.mapsSources && msg.mapsSources.length > 0) {
          citationsHtml += `<div class="gemini-citations-header" style="margin-top: 6px;"><i class="fa-solid fa-map-location-dot" style="color: #34d399;"></i> Google Maps Locations:</div>`;
          msg.mapsSources.forEach((src) => {
            citationsHtml += `
              <a href="${escapeHtml(src.uri)}" target="_blank" rel="noopener noreferrer" class="gemini-citation-chip maps-chip" title="${escapeHtml(src.title)}">
                <i class="fa-solid fa-location-arrow"></i>
                <span>${escapeHtml(src.title)}</span>
              </a>
            `;
          });
        }
        citationsHtml += `</div>`;
      }

      html += `
        <div class="gemini-msg ${isUser ? 'user' : 'model'}">
          <div class="gemini-msg-avatar">
            <i class="fa-solid ${isUser ? 'fa-user-ninja' : 'fa-shield-halved'}"></i>
          </div>
          <div class="gemini-msg-bubble">
            <div class="gemini-msg-meta">
              <span>${isUser ? '// OPERATOR' : '// ZeR0 AI (' + (msg.modelUsed || state.selectedModel) + ')'}</span>
              <span>${timeStr}</span>
            </div>
            <div class="gemini-msg-body">${formatMarkdown(msg.text)}</div>
            ${citationsHtml}
          </div>
        </div>
      `;
    });

    thread.innerHTML = html;
    thread.scrollTop = thread.scrollHeight;
  }

  async function handleChatSubmit() {
    const input = document.getElementById('geminiChatInput');
    const btnSend = document.getElementById('btnChatSend');
    if (!input || state.isSending) return;

    const text = input.value.trim();
    if (!text) return;

    // Reset input
    input.value = '';
    input.style.height = 'auto';

    // Append user message
    const userMsg = {
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    state.chatHistory.push(userMsg);
    renderChatHistory();

    // Disable input while generating
    state.isSending = true;
    if (btnSend) {
      btnSend.disabled = true;
      btnSend.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    }

    // Append temporary typing indicator
    const thread = document.getElementById('geminiChatThread');
    const loadingId = 'loadingMsg_' + Date.now();
    if (thread) {
      const loaderDiv = document.createElement('div');
      loaderDiv.id = loadingId;
      loaderDiv.className = 'gemini-msg model';
      loaderDiv.innerHTML = `
        <div class="gemini-msg-avatar"><i class="fa-solid fa-shield-halved"></i></div>
        <div class="gemini-msg-bubble">
          <div class="gemini-msg-meta"><span>// ZeR0 AI</span><span>REASONING...</span></div>
          <div class="gemini-msg-body" style="color: #94a3b8; font-family: var(--font-mono);">
            <i class="fa-solid fa-circle-notch fa-spin text-crimson"></i> Synthesizing response with ${state.selectedModel}...
          </div>
        </div>
      `;
      thread.appendChild(loaderDiv);
      thread.scrollTop = thread.scrollHeight;
    }

    try {
      // Optional Geolocation for Maps Grounding
      let userLocation = undefined;
      if (state.enableMapsGrounding && navigator.geolocation) {
        try {
          userLocation = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
              () => resolve(undefined),
              { timeout: 3000 }
            );
          });
        } catch (e) {}
      }

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: state.chatHistory.map((m) => ({ role: m.role, text: m.text })),
          model: state.selectedModel,
          systemRole: state.selectedRole,
          enableSearch: state.enableSearchGrounding,
          enableMaps: state.enableMapsGrounding,
          userLocation,
        }),
      });

      const data = await res.json();
      const loaderEl = document.getElementById(loadingId);
      if (loaderEl) loaderEl.remove();

      if (res.ok && data.reply) {
        const modelMsg = {
          role: 'model',
          text: data.reply,
          modelUsed: data.modelUsed,
          webSources: data.webSources || [],
          mapsSources: data.mapsSources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        state.chatHistory.push(modelMsg);

        // Save history (last 30 messages)
        try {
          localStorage.setItem(
            'zer0_ai_chat_history',
            JSON.stringify(state.chatHistory.slice(-30))
          );
        } catch (e) {}
      } else {
        const errMsg = {
          role: 'model',
          text: `⚠️ **Error:** ${data.error || 'Failed to connect to Gemini API backend.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        state.chatHistory.push(errMsg);
      }
    } catch (err) {
      const loaderEl = document.getElementById(loadingId);
      if (loaderEl) loaderEl.remove();
      state.chatHistory.push({
        role: 'model',
        text: `⚠️ **Network Exception:** Unable to reach server endpoint: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      state.isSending = false;
      if (btnSend) {
        btnSend.disabled = false;
        btnSend.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
      }
      renderChatHistory();
    }
  }

  // ==========================================================================
  // TAB 2: SEARCH GROUNDING RADAR
  // ==========================================================================
  async function executeSearchGrounding(query) {
    if (!query || !query.trim()) return;
    const box = document.getElementById('geminiSearchResultsBox');
    const btn = document.getElementById('btnExecuteSearch');
    if (!box) return;

    box.className = 'gemini-results-box loading';
    box.innerHTML = `<i class="fa-solid fa-satellite-dish fa-spin text-crimson"></i> Grounding live Google Search signals for: <strong>"${escapeHtml(query)}"</strong>...`;
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      box.className = 'gemini-results-box';

      if (res.ok && data.answer) {
        let sourcesHtml = '';
        if (data.sources && data.sources.length > 0) {
          sourcesHtml = `<div class="gemini-sources-panel">
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #38bdf8;">
              <i class="fa-brands fa-google text-crimson"></i> VERIFIED SEARCH CITATIONS (${data.sources.length}):
            </span>`;
          data.sources.forEach((src) => {
            sourcesHtml += `
              <a href="${escapeHtml(src.uri)}" target="_blank" rel="noopener noreferrer" class="gemini-source-card">
                <div style="min-width: 0;">
                  <div class="gemini-source-title">${escapeHtml(src.title)}</div>
                  <div class="gemini-source-uri">${escapeHtml(src.uri)}</div>
                </div>
                <i class="fa-solid fa-arrow-up-right-from-square" style="color: #38bdf8;"></i>
              </a>
            `;
          });
          sourcesHtml += `</div>`;
        }

        box.innerHTML = `
          <div style="margin-bottom: 12px; font-family: var(--font-mono); font-size: 11px; color: #34d399;">
            <i class="fa-solid fa-circle-check"></i> LIVE INTELLIGENCE RETRIEVED // MODEL: gemini-3.8-flash (Search Grounded)
          </div>
          <div>${formatMarkdown(data.answer)}</div>
          ${sourcesHtml}
        `;
      } else {
        box.innerHTML = `<span style="color: #ef4444;">⚠️ Error: ${escapeHtml(data.error || 'Failed to retrieve search grounded results.')}</span>`;
      }
    } catch (e) {
      box.className = 'gemini-results-box';
      box.innerHTML = `<span style="color: #ef4444;">⚠️ Network error: ${escapeHtml(e.message)}</span>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ==========================================================================
  // TAB 3: MAPS GROUNDING RADAR
  // ==========================================================================
  async function executeMapsGrounding(query) {
    if (!query || !query.trim()) return;
    const box = document.getElementById('geminiMapsResultsBox');
    const btn = document.getElementById('btnExecuteMaps');
    if (!box) return;

    box.className = 'gemini-results-box loading';
    box.innerHTML = `<i class="fa-solid fa-location-crosshairs fa-spin text-crimson"></i> Querying Google Maps Grounding for: <strong>"${escapeHtml(query)}"</strong>...`;
    if (btn) btn.disabled = true;

    try {
      // Optional browser geolocation
      let coords = null;
      if (navigator.geolocation) {
        try {
          coords = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
              () => resolve(null),
              { timeout: 3000 }
            );
          });
        } catch (e) {}
      }

      const payload = {
        query: query.trim(),
        latitude: coords ? coords.latitude : undefined,
        longitude: coords ? coords.longitude : undefined,
      };

      const res = await fetch('/api/gemini/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      box.className = 'gemini-results-box';

      if (res.ok && data.answer) {
        let placesHtml = '';
        if (data.places && data.places.length > 0) {
          placesHtml = `<div class="gemini-sources-panel">
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #34d399;">
              <i class="fa-solid fa-map-pin text-crimson"></i> GOOGLE MAPS PLACE LOCATIONS (${data.places.length}):
            </span>`;
          data.places.forEach((p) => {
            placesHtml += `
              <a href="${escapeHtml(p.uri)}" target="_blank" rel="noopener noreferrer" class="gemini-source-card maps-card">
                <div style="min-width: 0;">
                  <div class="gemini-source-title">${escapeHtml(p.title)}</div>
                  <div class="gemini-source-uri">${escapeHtml(p.uri)}</div>
                </div>
                <i class="fa-solid fa-location-dot" style="color: #34d399; font-size: 15px;"></i>
              </a>
            `;
          });
          placesHtml += `</div>`;
        }

        box.innerHTML = `
          <div style="margin-bottom: 12px; font-family: var(--font-mono); font-size: 11px; color: #34d399;">
            <i class="fa-solid fa-circle-check"></i> MAPS DATA GROUNDED // MODEL: gemini-3.8-flash (Google Maps Tool)
          </div>
          <div>${formatMarkdown(data.answer)}</div>
          ${placesHtml}
        `;
      } else {
        box.innerHTML = `<span style="color: #ef4444;">⚠️ Error: ${escapeHtml(data.error || 'Failed to retrieve Google Maps grounded results.')}</span>`;
      }
    } catch (e) {
      box.className = 'gemini-results-box';
      box.innerHTML = `<span style="color: #ef4444;">⚠️ Network error: ${escapeHtml(e.message)}</span>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ==========================================================================
  // TAB 4: AUDIO RECORDING & GEMINI 3.5 TRANSCRIBE
  // ==========================================================================
  async function toggleAudioRecording(triggerBtn) {
    if (state.isRecording) {
      stopAudioRecording();
    } else {
      await startAudioRecording(triggerBtn);
    }
  }

  async function startAudioRecording(triggerBtn) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording (navigator.mediaDevices.getUserMedia).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.audioChunks = [];

      // Determine best supported mimeType
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let selectedMime = 'audio/webm';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      state.mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });

      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          state.audioChunks.push(e.data);
        }
      };

      state.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(state.audioChunks, { type: selectedMime });
        await processAndTranscribeBlob(audioBlob, selectedMime);
      };

      state.mediaRecorder.start(250);
      state.isRecording = true;
      state.recordSeconds = 0;

      // Update UI for recording
      if (triggerBtn) triggerBtn.classList.add('recording');
      const bigMic = document.getElementById('btnBigRecordMic');
      if (bigMic) bigMic.classList.add('recording');
      const statusText = document.getElementById('geminiRecordStatusText');
      if (statusText) statusText.innerHTML = '<span style="color: #ff0038;"><i class="fa-solid fa-circle fa-beat text-crimson"></i> Recording active... Click again to stop & transcribe.</span>';

      const timerEl = document.getElementById('geminiRecordTimerDisplay');
      if (timerEl) timerEl.innerText = '00:00';

      state.recordTimerInterval = setInterval(() => {
        state.recordSeconds++;
        const mins = String(Math.floor(state.recordSeconds / 60)).padStart(2, '0');
        const secs = String(state.recordSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.innerText = `${mins}:${secs}`;
      }, 1000);
    } catch (err) {
      console.error('Microphone permission / initialization error:', err);
      alert('Microphone access denied or unavailable: ' + err.message);
    }
  }

  function stopAudioRecording() {
    if (state.mediaRecorder && state.isRecording) {
      state.mediaRecorder.stop();
      state.isRecording = false;
      if (state.recordTimerInterval) {
        clearInterval(state.recordTimerInterval);
        state.recordTimerInterval = null;
      }

      const micBtns = [
        document.getElementById('btnChatMic'),
        document.getElementById('btnBigRecordMic'),
      ];
      micBtns.forEach((b) => b && b.classList.remove('recording'));

      const statusText = document.getElementById('geminiRecordStatusText');
      if (statusText) statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-crimson"></i> Encoding audio & transcribing via gemini-3.5-transcribe...';
    }
  }

  async function processAndTranscribeBlob(blob, mimeType) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Audio = reader.result;
      await sendToGeminiTranscribe(base64Audio, mimeType);
    };
  }

  async function handleAudioFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const statusText = document.getElementById('geminiRecordStatusText');
    if (statusText) statusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-crimson"></i> Uploading ${escapeHtml(file.name)} and transcribing with gemini-3.5-transcribe...`;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      await sendToGeminiTranscribe(reader.result, file.type || 'audio/webm');
    };
  }

  async function sendToGeminiTranscribe(base64Data, mimeType) {
    const resultBox = document.getElementById('geminiTranscribeResultBox');
    const statusText = document.getElementById('geminiRecordStatusText');

    if (resultBox) {
      resultBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-crimson"></i> Transcribing audio stream with model <strong>gemini-3.5-transcribe</strong>...';
    }

    try {
      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: mimeType || 'audio/webm',
        }),
      });

      const data = await res.json();

      if (res.ok && data.transcription) {
        state.lastTranscription = data.transcription;

        if (resultBox) {
          resultBox.innerHTML = `
            <div style="margin-bottom: 8px; font-family: var(--font-mono); font-size: 11px; color: #34d399;">
              <i class="fa-solid fa-circle-check"></i> TRANSCRIBED SUCCESSFULLY // gemini-3.5-transcribe
            </div>
            <div style="font-size: 13.5px; color: #fff; line-height: 1.6;">${escapeHtml(data.transcription)}</div>
          `;
        }

        if (statusText) {
          statusText.innerHTML = `<span style="color: #34d399;"><i class="fa-solid fa-circle-check"></i> Audio successfully transcribed!</span>`;
        }

        // If recorded from chat input, automatically populate chat input
        if (state.voiceTarget === 'chat') {
          const chatInput = document.getElementById('geminiChatInput');
          if (chatInput) {
            chatInput.value = (chatInput.value ? chatInput.value + ' ' : '') + data.transcription;
            chatInput.focus();
          }
        }
      } else {
        if (resultBox) {
          resultBox.innerHTML = `<span style="color: #ef4444;">⚠️ Transcription failed: ${escapeHtml(data.error || 'Unknown error')}</span>`;
        }
        if (statusText) {
          statusText.innerHTML = `<span style="color: #ef4444;">⚠️ Transcription error.</span>`;
        }
      }
    } catch (e) {
      if (resultBox) {
        resultBox.innerHTML = `<span style="color: #ef4444;">⚠️ Network error: ${escapeHtml(e.message)}</span>`;
      }
      if (statusText) {
        statusText.innerHTML = `<span style="color: #ef4444;">⚠️ Network failure.</span>`;
      }
    }
  }

  // ==========================================================================
  // HELPERS: MARKDOWN FORMATTER & ESCAPING
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let out = escapeHtml(text);

    // Code blocks with syntax formatting
    out = out.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, function (_, lang, code) {
      return `<pre><div style="color: #64748b; font-size: 10px; margin-bottom: 4px;">// ${lang || 'CODE'}</div><code>${code}</code></pre>`;
    });

    // Inline code `...`
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet points
    out = out.replace(/^\s*[-*]\s+(.+)$/gm, '<li style="margin-left: 18px;">$1</li>');

    // Newlines to line breaks (outside pre)
    const parts = out.split(/(<pre>[\s\S]*?<\/pre>)/);
    out = parts
      .map((part) => {
        if (part.startsWith('<pre>')) return part;
        return part.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
      })
      .join('');

    return out;
  }

  // Export Global API
  window.ZeR0AI = {
    open: openSentinel,
    close: closeSentinel,
    switchTab: switchTab,
    searchThreatIntel: executeSearchGrounding,
    findTestingLabs: executeMapsGrounding,
  };
})();
