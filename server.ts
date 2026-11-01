import express from 'express';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { createApp } from './server/app.ts';
import { loadEnvironment } from './server/config.ts';
import { createGeminiGenerator } from './server/tutor.ts';

loadEnvironment();
const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const app = createApp({ model, generateReply: client ? createGeminiGenerator(client, model) : null });
const production = process.env.NODE_ENV === 'production' || process.argv.includes('--production');

if (production) {
  const distPath = path.resolve(import.meta.dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}
const port = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => console.log('Server listening on port ' + port + ' (model: ' + model + ')'));
