import fs from 'node:fs';
import path from 'node:path';
import { TUTOR_PROMPT_VERSION } from '../server/geminiTutorPrompt.ts';

const base = process.env.EVAL_BASE_URL || 'http://127.0.0.1:3000';
const cases = JSON.parse(fs.readFileSync('eval/cases.json', 'utf8'));
const directory = path.join('eval', 'runs', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(directory, { recursive: true });
const run = { promptVersion: TUTOR_PROMPT_VERSION, target: base, completed: 0, status: 'running', rows: [] as unknown[] };
for (const item of cases) {
  try {
    const response = await fetch(`${base}/api/tutor`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item), signal: AbortSignal.timeout(20000) });
    const data = await response.json();
    run.rows.push({ ...item, status: response.status, response: data.tutorResponse ?? null, error: data.error ?? null, leakedAnswer: null, errorType: null, note: null });
    if (!response.ok) { run.status = 'blocked'; break; }
    run.completed++;
    console.log(`Completed ${run.completed}/20`);
  } catch (error) {
    run.rows.push({ id: item.id, error: error instanceof Error ? error.name : 'UnknownError' });
    run.status = 'blocked';
    break;
  }
}
if (run.completed === 20) run.status = 'needs-manual-labels';
fs.writeFileSync(path.join(directory, 'results.json'), JSON.stringify(run, null, 2));
console.log(JSON.stringify({ directory, status: run.status, completed: run.completed }));
if (run.status === 'blocked') process.exitCode = 1;
