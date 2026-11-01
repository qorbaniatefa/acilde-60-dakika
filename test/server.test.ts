import { afterEach, describe, expect, it } from 'vitest';
import { once } from 'node:events';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import { createApp, type TutorGenerator } from '../server/app';
import { loadEnvironment } from '../server/config';
import { TUTOR_PROMPT_VERSION } from '../server/geminiTutorPrompt';

const servers: Server[] = [];
const input = { decisionId: 1, profile: { level: 'beginner', role: 'developer', goal: 'architecture' }, thought: 'Kapasiteyi nasıl gözlemleyebilirim?' };
async function start(generateReply: TutorGenerator | null, timeoutMs = 500) {
  const server = createApp({ generateReply, model: 'test-model', timeoutMs }).listen(0, '127.0.0.1');
  servers.push(server);
  await once(server, 'listening');
  return `http://127.0.0.1:${(server.address() as { port: number }).port}/api/tutor`;
}
const post = (url: string, body: unknown, signal?: AbortSignal) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal });
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); })));
});

describe('Tutor HTTP boundary', () => {
  it('advertises the loaded prompt version so resume clients can detect a stale server', async () => {
    const url = await start(null);
    const response = await fetch(url.replace('/api/tutor', '/api/health'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', hasApiKey: false, model: 'test-model', promptVersion: TUTOR_PROMPT_VERSION });
  });
  it('returns a real generator reply for a valid request', async () => {
    const url = await start(async () => 'Hangi ölçüm bu varsayımını sınayabilir?');
    const response = await post(url, input);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ tutorResponse: 'Hangi ölçüm bu varsayımını sınayabilir?' });
  });
  it.each([
    { level: 'bogus', role: 'developer', goal: 'architecture' },
    { level: 'beginner', role: {}, goal: 'architecture' },
    { level: 'beginner', role: 'developer', goal: true },
    { level: null, role: 'developer', goal: 'architecture' },
  ])('rejects invalid profile values before reaching the provider: %j', async profile => {
    const url = await start(async () => { throw new Error('Provider must not run for invalid input'); });
    expect((await post(url, { ...input, profile })).status).toBe(400);
  });
  it.each([{ ...input, decisionId: 4 }, { ...input, thought: '' }, { ...input, thought: 'x'.repeat(2001) }, null])('rejects malformed requests: %j', async body => {
    const url = await start(null);
    expect((await post(url, body)).status).toBe(400);
  });
  it('reports an unavailable tutor when no API client is configured', async () => {
    expect((await post(await start(null), input)).status).toBe(503);
  });
  it('does not return a fabricated reply when the provider fails', async () => {
    const response = await post(await start(async () => { throw new Error('upstream failure'); }), input);
    expect(response.status).toBe(502);
    expect(await response.json()).not.toHaveProperty('tutorResponse');
  });
  it('rejects an empty provider reply', async () => {
    expect((await post(await start(async () => '   '), input)).status).toBe(502);
  });
  it('aborts upstream work and returns 504 at the deadline', async () => {
    let aborted = false;
    const url = await start((_input, signal) => new Promise((resolve, reject) => {
      const delayed = setTimeout(() => resolve('Late provider reply'), 100);
      signal.addEventListener('abort', () => { clearTimeout(delayed); aborted = true; reject(signal.reason); }, { once: true });
    }), 30);
    expect((await post(url, input)).status).toBe(504);
    expect(aborted).toBe(true);
  });
  it('propagates a browser disconnect to the generator', async () => {
    let started!: () => void;
    let stopped!: () => void;
    const began = new Promise<void>(resolve => { started = resolve; });
    const ended = new Promise<void>(resolve => { stopped = resolve; });
    const url = await start((_input, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => { stopped(); reject(signal.reason); }, { once: true });
      started();
    }), 5000);
    const controller = new AbortController();
    const request = post(url, input, controller.signal).catch(() => undefined);
    await began;
    controller.abort();
    await request;
    const outcome = await Promise.race([ended.then(() => 'aborted'), new Promise(resolve => setTimeout(() => resolve('not aborted'), 1000))]);
    expect(outcome).toBe('aborted');
  });
  it('enforces the deadline even if a provider fails to honor cancellation', async () => {
    const url = await start(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'Late reply';
    }, 20);
    expect((await post(url, input)).status).toBe(504);
  });
});

describe('Local environment loading', () => {
  it('loads .env.local first while preserving an inherited deployment secret', () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'acilde-env-test-'));
    writeFileSync(path.join(directory, '.env'), 'GEMINI_API_KEY=base-test-value\nBASE_ONLY=yes\n');
    writeFileSync(path.join(directory, '.env.local'), 'GEMINI_API_KEY=local-test-value\n');
    const local: NodeJS.ProcessEnv = {};
    loadEnvironment(directory, local);
    expect(local.GEMINI_API_KEY).toBe('local-test-value');
    expect(local.BASE_ONLY).toBe('yes');
    const deployed = { GEMINI_API_KEY: 'inherited-test-value' };
    loadEnvironment(directory, deployed);
    expect(deployed.GEMINI_API_KEY).toBe('inherited-test-value');
  });
});
