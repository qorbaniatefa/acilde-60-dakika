// Real browser ONNX check. Does not replace the required Cypress regression run.
let chromium;
try { ({chromium} = require('playwright')); }
catch { ({chromium} = require('../.review-tools/node_modules/playwright')); }
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const base = process.argv[2] || 'http://127.0.0.1:3000';
  const report = {tool: 'Playwright/Edge', url: `${base}/?parite`, runtimeRequests: [], checks: []};
  let browser;
  let page;
  try {
    browser = await chromium.launch({channel: 'msedge', headless: true});
    page = await browser.newPage();
    page.on('request', request => {
      if (request.url().includes('/ort/')) report.runtimeRequests.push(request.url());
    });
    await page.goto(report.url);
    const probability = page.locator('[data-cy="p"]');
    await probability.waitFor({state: 'attached', timeout: 45000});
    report.modelSha256 = await page.evaluate(async () => (await (await fetch('./model/config.json')).json()).model_sha256);
    report.shortProbability = Number(await probability.textContent());
    for (const count of [5, 300]) {
      await page.locator(`[data-cy="parity-${count}"]`).click();
      await page.waitForFunction(expected => document.querySelector('[data-cy="parity-results"]')?.getAttribute('data-count') === String(expected), count, {timeout: 45000});
      const deltas = await page.locator('[data-cy="parity-row"]').evaluateAll(elements => elements.map(element => Number(element.getAttribute('data-delta'))));
      assert.equal(deltas.length, count);
      assert(deltas.every(delta => Number.isFinite(delta) && delta < .0001));
      report.checks.push({count, maxDelta: Math.max(...deltas)});
    }
    await page.locator('[data-cy="demo-deep"]').click();
    await page.locator('[data-cy="adaptive-hint"]').waitFor();
    report.deepProbability = Number(await probability.textContent());
    assert(report.shortProbability < .5 && report.deepProbability >= .5);
    assert.equal(await page.locator('vite-error-overlay').count(), 0);
    assert(report.runtimeRequests.every(url => !new URL(url).searchParams.has('import')));
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    report.error = error.message;
    if (page) report.pageText = (await page.locator('body').innerText().catch(() => '')).slice(0, 1500);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    fs.mkdirSync('docs/checks', {recursive: true});
    fs.writeFileSync('docs/checks/2026-11-04-runtime-browser.json', JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
  }
})();
