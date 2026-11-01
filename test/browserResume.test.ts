import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const cases = Array.from({ length: 20 }, (_, i) => ({
  id: `case-${i + 1}`, category: 'fixture', decisionId: 1,
  profile: { level: 'beginner', role: 'developer', goal: 'architecture' }, thought: `Fixture ${i + 1}`,
}));
const original = { promptVersion: '1.1.0', target: 'http://127.0.0.1:3000', completed: 16, status: 'blocked', rows:
  cases.slice(0, 16).map(c => ({ ...c, status: 200, response: `Original ${c.id}`, error: null, leakedAnswer: null, errorType: null, note: null })),
};

async function run(options: { failId?: string; model?: string; promptVersion?: string; healthPromptVersion?: string } = {}) {
  const posts: string[] = [];
  let downloaded: Blob | null = null;
  let stored: Blob | null = null;
  const context = {
    __SOURCE_RUN__: { ...structuredClone(original), promptVersion: options.promptVersion || '1.1.0' },
    __EXPECTED_PROMPT_VERSION__: options.promptVersion || '1.1.0',
    __EVAL_CASES__: structuredClone(cases), __SOURCE_SHA__: 'fixture-hash',
    window: {}, location: { origin: 'https://example.test' }, Blob, AbortSignal,
    URL: { createObjectURL: (b: Blob) => { stored = b; return 'blob:test'; }, revokeObjectURL: () => {} },
    document: { body: { appendChild: () => {} }, createElement: () => ({ click() { downloaded = stored; }, remove() {} }) },
    console: { log: () => {}, error: () => {} }, setTimeout: (fn: () => void) => { fn(); return 0; },
    fetch: async (url: string, init?: { body: string }) => {
      if (url === '/api/health') return { ok: true, status: 200, json: async () => ({ status: 'ok', hasApiKey: true, model: options.model || 'gemini-3.5-flash-lite', promptVersion: options.healthPromptVersion === 'missing' ? undefined : options.healthPromptVersion || options.promptVersion || '1.1.0' }) };
      const item = JSON.parse(init!.body); posts.push(item.id);
      const failed = options.failId === item.id;
      return { ok: !failed, status: failed ? 502 : 200, json: async () => failed ? { error: 'Unavailable' } : { tutorResponse: `New ${item.id}` } };
    },
  };
  await vm.runInNewContext(readFileSync('scripts/resume-eval.browser.js', 'utf8'), context);
  expect(downloaded).not.toBeNull();
  const output = JSON.parse(await (downloaded as unknown as Blob).text());
  return { posts, output };
}

describe('Resume only missing real evaluation responses', () => {
  it.each(['1.1.0', 'missing'])('sends no requests when running prompt version is %s instead of source 1.2.0', async healthPromptVersion => {
    const { posts, output } = await run({ promptVersion: '1.2.0', healthPromptVersion });
    expect(posts).toEqual([]);
    expect(output.completed).toBe(16);
    expect(output.status).toBe('blocked');
    expect(output.resumeError).toContain('prompt');
  });
  it('can finish a newer prompt run without relabeling it as the old version', async () => {
    const { posts, output } = await run({ promptVersion: '1.2.0' });
    expect(posts).toEqual(['case-17', 'case-18', 'case-19', 'case-20']);
    expect(output.completed).toBe(20);
    expect(output.promptVersion).toBe('1.2.0');
  });
  it('requests four missing cases and preserves all sixteen original replies', async () => {
    const { posts, output } = await run();
    expect(posts).toEqual(['case-17', 'case-18', 'case-19', 'case-20']);
    expect(output.completed).toBe(20);
    expect(output.status).toBe('needs-manual-labels');
    expect(output.rows.slice(0, 16)).toEqual(original.rows);
    expect(output.rows[19].response).toBe('New case-20');
    expect(output).not.toHaveProperty('leakageRate');
  });
  it('stops at a real failure without manufacturing the remaining replies', async () => {
    const { posts, output } = await run({ failId: 'case-18' });
    expect(posts).toEqual(['case-17', 'case-18']);
    expect(output.completed).toBe(17);
    expect(output.status).toBe('blocked');
    expect(output.rows.find((r: { id: string }) => r.id === 'case-19').response).toBeNull();
    expect(output.rows.slice(0, 16)).toEqual(original.rows);
  });
  it('does not mix samples from a different running model', async () => {
    const { posts, output } = await run({ model: 'different-model' });
    expect(posts).toEqual([]);
    expect(output.completed).toBe(16);
    expect(output.status).toBe('blocked');
    expect(output.resumeError).toContain('model');
  });
});
