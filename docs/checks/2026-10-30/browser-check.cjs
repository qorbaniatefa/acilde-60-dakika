const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = 'http://127.0.0.1:3106';
const report = { health: null, api: [], browser: [], findings: [], pageErrors: [], liveGeminiTested: false };
const artifact = name => path.join(__dirname, name);

async function checkAPI() {
  report.health = await (await fetch(base + '/api/health', { signal: AbortSignal.timeout(5000) })).json();
  const profile = { level: 'beginner', role: 'developer', goal: 'architecture' };
  const cases = [
    ['invalid_scene', { decisionId: 9, profile, thought: 'test' }, 400],
    ['missing_profile', { decisionId: 1, thought: 'test' }, 400],
    ['blank_thought', { decisionId: 1, profile, thought: '   ' }, 400],
    ['overlong_thought', { decisionId: 1, profile, thought: 'x'.repeat(2001) }, 400],
    ['null_body', null, 400],
  ];
  if (!report.health.hasApiKey) {
    cases.push(['invalid_profile_values', { decisionId: 1, profile: { level: 'bogus', role: {}, goal: true }, thought: 'test' }, 400]);
    cases.push(['valid_request_without_key', { decisionId: 1, profile, thought: 'test' }, 503]);
  }
  for (const [name, body, expected] of cases) {
    const res = await fetch(base + '/api/tutor', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
    });
    report.api.push({ name, expected, actual: res.status, passed: res.status === expected });
    await res.text();
  }
}

async function measure(page, stage, gamePath) {
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  if (dimensions.content > dimensions.viewport) report.findings.push({ name: 'horizontal_overflow', stage, gamePath, ...dimensions });
}

async function checkBrowser() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    // Use local app code and system font fallbacks; do not make external API or asset calls.
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push(error.message));
    for (const gamePath of ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB']) {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      const start = page.locator('[data-cy="start"]');
      await start.waitFor();
      assert(await start.isDisabled(), 'Unanswered profile must prevent start');
      await measure(page, 'profile', gamePath);
      await page.locator('[data-cy="profile-level"] button').nth(gamePath.startsWith('A') ? 0 : 1).click();
      await page.locator('[data-cy="profile-role"] button').nth(gamePath.startsWith('A') ? 0 : 1).click();
      await page.locator('[data-cy="profile-goal"] button').nth(gamePath.endsWith('A') ? 0 : 2).click();
      await start.click();
      for (let decision = 0; decision < 3; decision++) {
        assert.equal(await page.locator('[data-cy="feedback-what"]').count(), 0, 'Feedback must not be present before choice');
        assert.equal(await page.locator('[data-cy="continue"]').count(), 0, 'Continue must not be present before choice');
        await measure(page, 'decision_' + (decision + 1), gamePath);
        if (gamePath === 'AAA' && decision === 0 && !report.health.hasApiKey) {
          await page.locator('[data-cy="tutor-input"]').fill('Gelen isteklerle kapasite arasındaki ilişkiyi düşünüyorum.');
          await page.locator('[data-cy="tutor-submit"]').click();
          await page.locator('[data-cy="tutor-error"]').waitFor();
          report.browser.push({ name: 'missing_key_error_without_blocking_game', passed: true });
        }
        await page.locator('[data-cy="choice-' + gamePath[decision] + '"]').click();
        assert(await page.locator('[data-cy="choice-A"]').isDisabled(), 'A must be locked');
        assert(await page.locator('[data-cy="choice-B"]').isDisabled(), 'B must be locked');
        await page.locator('[data-cy="feedback-what"]').waitFor();
        await page.locator('[data-cy="feedback-why"]').waitFor();
        await page.locator('[data-cy="continue"]').click();
        if (decision < 2) {
          const title = decision === 0 ? 'Müdahaleyi Doğrula' : 'Ekibi Bilgilendir';
          await page.getByRole('heading', { name: title, exact: true }).waitFor();
        }
      }
      const ending = page.locator('[data-cy="ending"]');
      await ending.waitFor();
      assert.equal(await ending.textContent(), gamePath === 'AAA' ? 'Nöbet Kontrol Altında' : 'Krizin Bedeli');
      await measure(page, 'ending', gamePath);
      if (gamePath === 'AAB') {
        const body = await page.locator('body').innerText();
        report.findings.push({ name: 'AAB_working_system_but_bottleneck_badge', reproduced: body.includes('Sistem kontrollü çalışıyor') && body.includes('DARBOĞAZ VAR') });
      }
      if (gamePath === 'AAA' || gamePath === 'AAB') await page.screenshot({ path: artifact('ending-' + gamePath + '.png'), fullPage: true, timeout: 10000 });
      await page.locator('[data-cy="restart"]').click();
      await start.waitFor();
      assert(await start.isDisabled(), 'Restart must clear profile');
      assert.equal(await page.locator('[aria-pressed="true"]').count(), 0, 'Restart must clear selections');
      report.browser.push({ name: gamePath, passed: true, viewport: 375 });
    }
    await context.close();
  } finally {
    await browser.close();
  }
}

(async () => {
  try {
    await checkAPI();
    await checkBrowser();
  } catch (error) {
    report.executionError = String(error.stack || error);
  } finally {
    fs.writeFileSync(artifact('results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    if (report.executionError) process.exitCode = 1;
  }
})();
