// Optional fallback verification tool; Cypress remains the required E2E suite.
let chromium;
try { ({chromium} = require('playwright')); }
catch { ({chromium} = require('../.review-tools/node_modules/playwright')); }
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const report = {tool: 'Playwright/Edge', modelInferenceTested: false, checks: [], pageErrors: []};
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  const context = await browser.newContext({viewport: {width: 375, height: 812}, acceptDownloads: true});
  const page = await context.newPage();
  page.on('pageerror', e => report.pageErrors.push(e.message));
  const control = name => page.locator(`[data-cy="${name}"]`);
  const profile = async (experienced = false) => {
    for (const name of ['profile-level', 'profile-role', 'profile-goal']) {
      await control(name).locator('button').nth(experienced ? 1 : 0).click();
    }
    await control('start').click();
  };
  const overflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  try {
    for (const route of ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB']) {
      await page.goto('http://127.0.0.1:3000');
      assert(await control('start').isDisabled());
      await profile(route.startsWith('B'));
      for (const choice of route) {
        await overflow();
        await control(`choice-${choice}`).click();
        assert(await control('choice-A').isDisabled());
        await control('feedback-what').waitFor({state: 'visible'});
        await control('continue').click();
      }
      assert.equal(await control('ending').innerText(), route === 'AAA' ? 'Nöbet Kontrol Altında' : 'Krizin Bedeli');
      await overflow();
      await control('restart').click();
      assert(await control('start').isDisabled());
      assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
      report.checks.push({name: `path-${route}`, passed: true});
    }
    await page.goto('http://127.0.0.1:3000');
    await control('profile-level').locator('button').first().click();
    await control('profile-role').locator('button').first().click();
    assert(await control('start').isDisabled());
    report.checks.push({name: 'incomplete-profile', passed: true});
    await page.goto('http://127.0.0.1:3000');
    await page.route('**/api/tutor', route => route.fulfill({status: 503, contentType: 'application/json', body: '{"error":"unavailable"}'}));
    await profile(true);
    assert.equal(await page.getByText('YENİ BAŞLAYAN İÇİN TERİM').count(), 0);
    await control('tutor-input').fill('Test icin gerekce.');
    await control('tutor-submit').click();
    await control('tutor-error').waitFor({state: 'visible'});
    await control('choice-A').click();
    await control('continue').click();
    report.checks.push({name: 'experienced-profile-and-tutor-error', passed: true, simulated: 'tutor HTTP 503 only'});
    await page.route('**/model/config.json', route => route.fulfill({status: 503, body: 'unavailable'}));
    await page.goto('http://127.0.0.1:3000');
    await profile();
    await page.getByText('Model kullanılamıyor. Hikâyeye ve öğretmene devam edebilirsin.').waitFor();
    await control('choice-A').click();
    await control('feedback-what').waitFor();
    assert((await control('collection-count').innerText()).includes('0 / 15'));
    report.checks.push({name: 'missing-model-and-no-consent', passed: true});
    await page.unroute('**/model/config.json');
    await page.goto('http://127.0.0.1:3000');
    await control('collection-consent').check();
    await profile();
    await control('tutor-input').fill('THIS_TEXT_MUST_NOT_APPEAR_IN_CSV');
    for (let scene = 1; scene <= 3; scene++) {
      await control('choice-A').click();
      assert.equal(await control('feedback-what').count(), 0);
      await control(scene === 2 ? 'label-no' : 'label-yes').click();
      await control('feedback-what').waitFor();
      await control('continue').click();
    }
    assert((await control('collection-count').innerText()).includes('1 / 15'));
    const downloading = page.waitForEvent('download');
    await control('download-data').click();
    const download = await downloading;
    const temporaryDirectory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'primer-v2-browser-'));
    const downloadedPath = path.join(temporaryDirectory, 'AUTOMATED-TEST-ONLY.csv');
    await download.saveAs(downloadedPath);
    const csv = fs.readFileSync(downloadedPath, 'utf8');
    assert(!csv.includes('THIS_TEXT_MUST_NOT_APPEAR_IN_CSV'));
    const lines = csv.trim().split(/\r?\n/);
    assert.equal(lines.length, 4);
    const ids = new Set(lines.slice(1).map(line => line.split(',')[0]));
    assert.equal(ids.size, 1);
    assert.match([...ids][0], /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
    fs.unlinkSync(downloadedPath);
    fs.rmdirSync(temporaryDirectory);
    await control('restart').click();
    assert(!(await control('collection-consent').isChecked()));
    report.checks.push({name: 'consented-complete-session-export-no-text', passed: true, syntheticAutomationOnly: true});
    await page.setViewportSize({width: 1280, height: 800});
    await profile();
    for (const choice of 'AAA') {await control(`choice-${choice}`).click(); await control('continue').click();}
    assert.equal(await control('ending').innerText(), 'Nöbet Kontrol Altında');
    await overflow();
    report.checks.push({name: 'desktop-good-ending', passed: true});
    assert.equal(report.pageErrors.length, 0);
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed'; report.error = error.stack;
    process.exitCode = 1;
  } finally {
    const filename = path.join(root, 'docs/checks/2026-11-04-primer-v2-browser.json');
    fs.writeFileSync(filename, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
    await browser.close();
  }
})();
