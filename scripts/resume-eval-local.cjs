// Run the tested browser resume helper against the local application.
// Only the DOM download is adapted; all HTTP requests use the actual server.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

(async () => {
  const root = path.resolve(__dirname, '..');
  const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'results.json');
  const raw = fs.readFileSync(sourcePath);
  const source = JSON.parse(raw);
  const cases = JSON.parse(fs.readFileSync(path.join(root, 'eval/cases.json'), 'utf8'));
  const sha = crypto.createHash('sha256').update(raw).digest('hex');
  const script = fs.readFileSync(path.join(root, 'scripts/resume-eval.browser.js'), 'utf8');
  const currentPrompt = fs.readFileSync(path.join(root, 'server/geminiTutorPrompt.ts'), 'utf8');
  const currentVersion = currentPrompt.match(/TUTOR_PROMPT_VERSION = '([^']+)'/)?.[1];
  if (source.promptVersion !== currentVersion) throw new Error('Source run and running source prompt versions differ. Restart the server after any prompt change.');
  let storedBlob;
  let downloadedBlob;
  const base = 'http://127.0.0.1:3000';
  await vm.runInNewContext(script, {
    __SOURCE_RUN__: source, __EXPECTED_PROMPT_VERSION__: currentVersion,
    __EVAL_CASES__: cases, __SOURCE_SHA__: sha,
    window: {}, location: { origin: base }, Blob, AbortSignal, console, setTimeout,
    URL: { createObjectURL(blob) { storedBlob = blob; return 'blob:local-download'; }, revokeObjectURL() {} },
    document: {
      body: { appendChild() {} },
      createElement() { return { click() { downloadedBlob = storedBlob; }, remove() {} }; },
    },
    fetch: (url, init) => fetch(new URL(url, base), init),
  });
  if (!downloadedBlob) throw new Error('The resume helper did not produce a result.');
  const serialized = await downloadedBlob.text();
  const result = JSON.parse(serialized);
  const directory = path.join(root, 'eval/runs', new Date().toISOString().replace(/[:.]/g, '-') + '-resumed');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'results.json'), serialized + '\n');
  console.log(JSON.stringify({ directory, completed: result.completed, status: result.status }));
  if (result.status !== 'needs-manual-labels') process.exitCode = 1;
})().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
