import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const sdk = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock('@google/genai', () => ({ GoogleGenAI: class { models = { generateContent: sdk.generate }; } }));
let directory: string;
let exitCode: typeof process.exitCode;
beforeEach(() => {
  vi.resetModules();
  sdk.generate.mockReset();
  exitCode = process.exitCode;
  directory = mkdtempSync(path.join(tmpdir(), 'acilde-provider-test-'));
  vi.spyOn(process, 'cwd').mockReturnValue(directory);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubEnv('GEMINI_API_KEY', 'nonsecret-test-value');
  vi.stubEnv('GEMINI_MODEL', 'gemini-3.8-flash');
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); process.exitCode = exitCode; });

describe('Provider diagnostic evidence', () => {
  it('preserves the upstream error without writing the credential', async () => {
    sdk.generate.mockRejectedValue(Object.assign(new Error('Gateway timeout for https://example.test?key=nonsecret-test-value'), { name: 'ApiError', status: 504 }));
    await import('../scripts/probe-model');
    const output = path.join(directory, 'eval/diagnostics/provider.json');
    expect(existsSync(output)).toBe(true);
    const raw = readFileSync(output, 'utf8');
    const data = JSON.parse(raw);
    expect(data.status).toBe(504);
    expect(data.responseReceived).toBe(false);
    expect(data.timeoutOrigin).toBe('upstream-or-gateway');
    expect(data.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(raw).not.toContain('nonsecret-test-value');
    expect(data.message).toContain('[REDACTED]');
  });
  it('saves an observed success and its latency instead of a leakage score', async () => {
    sdk.generate.mockResolvedValue({ text: 'Hangi gözleme ihtiyaç duyarsın?' });
    await import('../scripts/probe-model');
    const output = path.join(directory, 'eval/diagnostics/provider.json');
    expect(existsSync(output)).toBe(true);
    const data = JSON.parse(readFileSync(output, 'utf8'));
    expect(data.responseReceived).toBe(true);
    expect(data.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(data).not.toHaveProperty('leakageRate');
    expect(data).not.toHaveProperty('apiKey');
  });
});
