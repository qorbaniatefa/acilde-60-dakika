// Template: generate the standalone console file with scripts/prepare-partial-eval.py.
(async () => {
  if (window.__tutorEvaluationActive) throw new Error('An evaluation is already running.');
  window.__tutorEvaluationActive = true;
  const source = __SOURCE_RUN__;
  const cases = __EVAL_CASES__;
  const run = {
    ...source, target: location.origin, status: 'blocked', expected: cases.length,
    resumeOf: __SOURCE_SHA__, resumedAt: new Date().toISOString(),
    priorFailedAttempts: source.rows.filter(row => row.status !== 200 || !row.response),
    rows: [],
  };
  const successful = row => row.status === 200 && typeof row.response === 'string' && row.response.trim().length > 0;
  try {
    if (source.promptVersion !== __EXPECTED_PROMPT_VERSION__) throw new Error('Unexpected source prompt version.');
    if (new Set(cases.map(item => item.id)).size !== cases.length) throw new Error('Duplicate case IDs.');
    const byId = new Map(source.rows.map(row => [row.id, row]));
    if (byId.size !== source.rows.length) throw new Error('Duplicate source IDs.');
    for (const row of source.rows) {
      const item = cases.find(candidate => candidate.id === row.id);
      if (!item || ['thought', 'category', 'decisionId'].some(key => row[key] !== item[key]) ||
          ['level', 'role', 'goal'].some(key => row.profile?.[key] !== item.profile[key])) {
        throw new Error('Source inputs differ from the canonical cases.');
      }
    }
    run.rows = cases.map(item => {
      const old = byId.get(item.id);
      return old && successful(old) ? old : { ...item, status: null, response: null, error: null, leakedAnswer: null, errorType: null, note: null };
    });
    run.completed = run.rows.filter(successful).length;
    const healthResponse = await fetch('/api/health', { signal: AbortSignal.timeout(20000) });
    const health = await healthResponse.json();
    if (!healthResponse.ok || health.status !== 'ok' || !health.hasApiKey) throw new Error('Open the working application itself; its API must be configured.');
    if (health.model !== 'gemini-3.5-flash-lite') throw new Error('Running model differs from the original model.');
    if (health.promptVersion !== source.promptVersion) throw new Error('Running prompt version is missing or differs from the original prompt. Restart the correct server.');
    run.runtime = { model: health.model, promptVersion: health.promptVersion, hasApiKey: health.hasApiKey };
    let sent = 0;
    for (let index = 0; index < run.rows.length; index++) {
      if (successful(run.rows[index])) continue;
      if (sent > 0) await new Promise(resolve => setTimeout(resolve, 2000));
      const item = cases[index];
      sent++;
      const response = await fetch('/api/tutor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item), signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      const valid = response.ok && typeof data.tutorResponse === 'string' && data.tutorResponse.trim().length > 0;
      run.rows[index] = {
        ...item, status: response.status, response: valid ? data.tutorResponse : null,
        error: valid ? null : (data.error || 'Empty or invalid tutor response'),
        leakedAnswer: null, errorType: null, note: null,
      };
      if (!valid) throw new Error(`${item.id}: HTTP ${response.status}; stopped without retry.`);
      run.completed = run.rows.filter(successful).length;
      console.log(`Completed ${run.completed}/${cases.length}`);
    }
    run.status = 'needs-manual-labels';
  } catch (error) {
    run.resumeError = error instanceof Error ? error.message : String(error);
    console.error(run.resumeError);
  } finally {
    run.completed = run.rows.filter(successful).length;
    run.missingCaseIds = cases.filter(item => !run.rows.some(row => row.id === item.id && successful(row))).map(item => item.id);
    const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'results-resumed.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    window.__tutorEvaluationActive = false;
    console.log(`Saved results-resumed.json: ${run.completed}/${cases.length}`);
  }
})();
