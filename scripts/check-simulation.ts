import assert from 'node:assert/strict';
import { once } from 'node:events';
import { GoogleGenAI } from '@google/genai';
import { createApp } from '../server/app.ts';
import { createGeminiGenerator } from '../server/tutor.ts';

const scenario = process.argv[2] || 'success';
const expected = { success: 200, error: 502, timeout: 504 }[scenario];
assert(expected, 'Use success, error, or timeout');
const baseUrl = process.env.SIM_BASE_URL || 'http://127.0.0.1:4017/gemini';
const headers: Record<string, string> = {};
if (process.env.SIM_DIRECT === 'true') {
  if (scenario === 'error') headers['x-mock-response-code'] = '503';
  if (scenario === 'timeout') headers['x-mock-delay-ms'] = '500';
}
const client = new GoogleGenAI({ apiKey: 'simulation-only', httpOptions: { baseUrl, apiVersion: 'v1beta', headers } });
const app = createApp({ model: 'test-model', generateReply: createGeminiGenerator(client, 'test-model'), timeoutMs: scenario === 'timeout' ? 150 : 5000 });
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
try {
  const response = await fetch(`http://127.0.0.1:${(server.address() as {port:number}).port}/api/tutor`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisionId: 1, profile: { level: 'beginner', role: 'developer', goal: 'architecture' }, thought: 'Kapasiteyi nasıl gözlemleyebilirim?' }),
    signal: AbortSignal.timeout(8000),
  });
  const body = await response.json();
  assert.equal(response.status, expected);
  if (expected === 200) assert.equal(typeof body.tutorResponse, 'string');
  else assert.equal(body.tutorResponse, undefined);
  console.log(JSON.stringify({ scenario, status: response.status, passed: true, target: process.env.SIM_DIRECT === 'true' ? 'local-postman-generated-handler' : 'local-postman-simulation' }));
} finally {
  server.closeAllConnections();
  await new Promise<void>(resolve => server.close(() => resolve()));
}
