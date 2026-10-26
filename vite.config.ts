import { defineConfig, Plugin } from 'vite';
import express from 'express';
import cors from 'cors';
import { setupGeminiApi } from './api-routes';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      const app = express();
      app.use(cors());
      app.use(express.json({ limit: '50mb' }));
      app.use(express.urlencoded({ extended: true, limit: '50mb' }));

      // Attach all Gemini API endpoints (/api/gemini/chat, /api/gemini/search, /api/gemini/maps, /api/gemini/transcribe)
      setupGeminiApi(app);

      // Mount onto Vite middlewares
      server.middlewares.use(app);
    },
  };
}

import { resolve } from 'path';

export default defineConfig({
  plugins: [geminiApiPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hub: resolve(__dirname, 'hub.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
      },
    },
  },
});
