import { GoogleGenAI } from '@google/genai';
import { loadEnvironment } from '../server/config.ts';
import fs from 'node:fs';
import path from 'node:path';
loadEnvironment();
const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const key = process.env.GEMINI_API_KEY;
const timeoutMs = 60000;
const started = performance.now();
const result: Record<string, unknown> = { configured: false, model, responseReceived: false, timeoutMs };
if (!key || /^(MY_|YOUR_|PLACEHOLDER|DUMMY)/i.test(key)) {
  result.reason = 'missing-or-placeholder-secret';
  process.exitCode = 1;
} else {
  result.configured = true;
  try {
    const client = new GoogleGenAI({ apiKey: key });
    const response = await client.models.generateContent({ model, contents: 'Türkçe tek kısa düşünme sorusu sor.', config: { httpOptions: { timeout: timeoutMs, retryOptions: { attempts: 1 } } } });
    result.responseReceived = Boolean(response.text?.trim());
    if (!result.responseReceived) { result.reason = 'empty-response'; process.exitCode = 1; }
  } catch (error) {
    const failure = error as { name?: string; status?: number; code?: string; cause?: { code?: string } };
    const message = (error instanceof Error ? error.message : '')
      .split(key).join('[REDACTED]')
      .replace(/AIza[A-Za-z0-9_-]{20,}/g, '[REDACTED]')
      .replace(/([?&](?:key|api_key|token)=)[^&\s"']+/gi, '$1[REDACTED]')
      .slice(0, 1200);
    const clientTimeout = /client.side timeout/i.test(message)
      || ['AbortError', 'TimeoutError', 'RequestTimeoutError', 'APIConnectionTimeoutError'].includes(failure.name || '');
    Object.assign(result, {
      error: failure.name,
      status: failure.status,
      code: failure.code || failure.cause?.code,
      message,
      timeoutOrigin: clientTimeout ? 'client' : failure.status === 504 ? 'upstream-or-gateway' : 'unknown',
    });
    process.exitCode = 1;
  }
}
result.elapsedMs = Math.round(performance.now() - started);
const directory = path.join(process.cwd(), 'eval', 'diagnostics');
fs.mkdirSync(directory, { recursive: true });
const serialized = JSON.stringify(result, null, 2);
fs.writeFileSync(path.join(directory, 'provider.json'), serialized + '\n');
console.log(serialized);
