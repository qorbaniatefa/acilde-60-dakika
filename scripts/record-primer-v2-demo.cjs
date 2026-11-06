// Reproducible local screen recording. Uses actual app + ONNX, never stubbed probabilities.
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('../.review-tools/node_modules/playwright')); }
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'dist');
const prefix = '/acilde-60-dakika/';
const outputDir = path.join(root, 'artifacts/demo');
const evidenceDir = path.join(root, 'docs/checks/2026-11-06-v2-demo');
const modelHash = '7c2dc8cb9b45fa53e670cb4797b52123cb18d5f54df3aad732d80b6f813f64aa';
const revision = '816ac3e612d7684e79ba6b2f28d6104e0e7c3139';
const dryRun = process.argv.includes('--check');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.wasm': 'application/wasm', '.onnx': 'application/octet-stream',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

function assTime(value) {
  const centiseconds = Math.round(value * 100);
  return `${Math.floor(centiseconds / 360000)}:${String(Math.floor(centiseconds / 6000) % 60).padStart(2, '0')}:${String(Math.floor(centiseconds / 100) % 60).padStart(2, '0')}.${String(centiseconds % 100).padStart(2, '0')}`;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(evidenceDir, { recursive: true });
  const config = JSON.parse(fs.readFileSync(path.join(site, 'model/config.json'), 'utf8'));
  const actualHash = createHash('sha256').update(fs.readFileSync(path.join(site, 'model/model.onnx'))).digest('hex');
  assert.equal(actualHash, modelHash);
  assert.equal(config.model_sha256, modelHash);
  assert.equal(config.release_eligible, false);
  const report = { status: 'started', source: 'actual_local_static_build', synthetic_pilot: true,
    probabilities_stubbed: false, model_sha256: actualHash, published_hf_revision: revision,
    network_note: 'Hosted site unavailable to agent browser (ERR_NETWORK_ACCESS_DENIED). Local server selects local model files; app and ONNX bytes are unchanged.',
    viewport: { width: 720, height: 960 }, checks: [], events: [], pageErrors: [] };
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (!url.pathname.startsWith(prefix)) { response.writeHead(404).end(); return; }
    if (url.pathname === prefix + 'model-release.json') {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ source: 'local', status: 'synthetic_pilot', model_sha256: modelHash }));
      return;
    }
    let filename;
    try { filename = path.resolve(site, decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html'); }
    catch { response.writeHead(400).end(); return; }
    if (!filename.startsWith(site + path.sep)) { response.writeHead(403).end(); return; }
    fs.readFile(filename, (error, bytes) => {
      if (error) { response.writeHead(404).end(); return; }
      response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
      response.end(bytes);
    });
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(3126, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:3126${prefix}`;
  let browser;
  let context;
  let video;
  let videoOrigin;
  let started;
  const captions = [];
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    context = await browser.newContext({ viewport: report.viewport, reducedMotion: 'reduce',
      ...(dryRun ? {} : { recordVideo: { dir: path.join(outputDir, 'raw-v2'), size: report.viewport } }) });
    await context.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = 'body { padding-top: 44px !important; }';
        document.head.append(style);
      });
    });
    const page = await context.newPage();
    videoOrigin = Date.now();
    video = page.video();
    page.on('pageerror', error => report.pageErrors.push(error.message));
    const control = name => page.locator(`[data-cy="${name}"]`);
    const waitForProbability = () => control('p').waitFor({ state: 'attached', timeout: 20000 });
    const openInfo = async () => {
      const detail = control('model-status').locator('details');
      if (!(await detail.getAttribute('open')) && !(await detail.evaluate(el => el.open))) {
        await detail.locator('summary').click();
      }
    };
    const top = () => page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    const shot = name => page.screenshot({ path: path.join(evidenceDir, `${name}.png`) });
    await page.goto(base + '?parite', { waitUntil: 'domcontentloaded' });
    await waitForProbability();
    await openInfo();
    report.short_probability = Number(await control('p').textContent());
    assert(report.short_probability < .5);
    assert.equal(await control('adaptive-hint').count(), 0);
    await shot('01-short');
    if (dryRun) {
      await control('demo-deep').click();
      await control('adaptive-hint').waitFor();
      await openInfo();
      report.deep_probability = Number(await control('p').textContent());
      assert(report.deep_probability >= .5);
      for (const count of [5, 300]) {
        await control(`parity-${count}`).click();
        await page.waitForFunction(n => document.querySelector('[data-cy="parity-results"]')?.getAttribute('data-count') === String(n), count);
        const deltas = await control('parity-row').evaluateAll(rows => rows.map(row => Number(row.dataset.delta)));
        assert.equal(deltas.length, count);
        assert(deltas.every(delta => Number.isFinite(delta) && delta < .0001));
        report.checks.push({ count, max_delta: Math.max(...deltas) });
      }
    } else {
      started = Date.now();
      report.trim_start_seconds = (started - videoOrigin) / 1000;
      const at = async seconds => {
        const remaining = started + seconds * 1000 - Date.now();
        if (remaining > 0) await page.waitForTimeout(remaining);
      };
      const stage = (name, caption) => {
        const seconds = (Date.now() - started) / 1000;
        report.events.push({ name, seconds });
        captions.push({ seconds, text: caption });
        console.log(name);
      };
      stage('intro', 'Primer v2: açıklama derinliğini öğrenen küçük model.\\N180 sentetik oturum; gerçek kullanıcı başarısı ölçülmedi.');
      await at(8);
      stage('short-profile', 'Aynı sahne · Akıcı ilerleyen demo profili\\Np ≈ 0,00863 < 0,5 → kısa anlatım');
      await at(18);
      await control('demo-deep').click();
      await control('adaptive-hint').waitFor();
      await openInfo();
      report.deep_probability = Number(await control('p').textContent());
      assert(report.deep_probability >= .5);
      stage('deep-profile', 'Düşünerek ilerleyen demo profili · aynı sahne\\Np ≈ 0,90222 ≥ 0,5 → ek soru ve terim açıklaması');
      await shot('02-deep');
      await at(31);
      await control('parity-5').click();
      await page.waitForFunction(() => document.querySelector('[data-cy="parity-results"]')?.getAttribute('data-count') === '5');
      const deltas5 = await control('parity-row').evaluateAll(rows => rows.map(row => Number(row.dataset.delta)));
      assert(deltas5.length === 5 && deltas5.every(delta => delta < .0001));
      report.checks.push({ count: 5, max_delta: Math.max(...deltas5) });
      stage('five-reference-parity', '5 referans: Python oracle ↔ gerçek tarayıcı WASM\\NMaksimum fark ≈ 1,19×10⁻⁷; tolerans < 10⁻⁴');
      await shot('03-parity-5');
      await at(44);
      await control('parity-300').click();
      await page.waitForFunction(() => document.querySelector('[data-cy="parity-results"]')?.getAttribute('data-count') === '300');
      const deltas300 = await control('parity-row').evaluateAll(rows => rows.map(row => Number(row.dataset.delta)));
      assert(deltas300.length === 300 && deltas300.every(delta => delta < .0001));
      report.checks.push({ count: 300, max_delta: Math.max(...deltas300) });
      stage('three-hundred-reference-parity', '300 girdi de aynı toleransı geçti.\\NOlasılıklar kayıt sırasında ONNX ile hesaplandı.');
      await shot('04-parity-300');
      await at(52);
      await page.getByRole('link', { name: 'Hikâyeye dön' }).click();
      await control('start').waitFor();
      await top();
      stage('story-profile', 'Mevcut hikâye: üç soruyla profil seçimi.\\NBu kayıt veri toplama modu değildir.');
      await at(55);
      for (const field of ['profile-level', 'profile-role', 'profile-goal']) {
        await control(field).locator('button').first().click();
        await page.waitForTimeout(600);
      }
      await at(60);
      await control('start').click();
      await control('choice-A').waitFor();
      await top();
      stage('story-decision', 'Model desteği hikâyede de çalışıyor.\\NKarar yolları ve geri bildirim akışı korunuyor.');
      await at(65);
      await control('choice-A').click();
      await control('feedback-why').waitFor();
      await control('feedback-what').scrollIntoViewIfNeeded();
      await shot('05-story-feedback');
      await at(70);
      await page.goto(base + '?parite', { waitUntil: 'domcontentloaded' });
      await waitForProbability();
      await openInfo();
      await top();
      stage('release', 'HF: Atefa/acilde-primer-v2-pilot · commit 816ac3e…\\NYerel ONNX, yayımlanan modelle aynı SHA-256 değerinde.');
      await at(78);
      report.duration_seconds = (Date.now() - started) / 1000;
      assert(report.duration_seconds >= 60 && report.duration_seconds <= 90);
      const end = report.duration_seconds;
      const assHeader = `[Script Info]\nScriptType: v4.00+\nPlayResX: 720\nPlayResY: 1080\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,Segoe UI,23,&H00FFFFFF,&H00FFFFFF,&H0013230A,&H0013230A,0,0,0,0,100,100,0,0,1,1,0,2,22,22,20,1\nStyle: Banner,Segoe UI,19,&H00A3DE4E,&H00FFFFFF,&H0013230A,&H0013230A,-1,0,0,0,100,100,0,0,1,1,0,8,12,12,12,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
      let ass = assHeader + `Dialogue: 0,0:00:00.00,${assTime(end)},Banner,,0,0,0,,YEREL KAYIT · SENTETİK PİLOT · GERÇEK ONNX\n`;
      captions.forEach((caption, i) => {
        ass += `Dialogue: 0,${assTime(caption.seconds)},${assTime(captions[i + 1]?.seconds ?? end)},Caption,,0,0,0,,${caption.text}\n`;
      });
      fs.writeFileSync(path.join(outputDir, 'primer-v2-pilot.ass'), ass, 'utf8');
    }
    assert.equal(report.pageErrors.length, 0);
    report.status = dryRun ? 'preflight_passed' : 'recorded';
  } catch (error) {
    report.status = 'failed';
    report.error = error.stack;
    process.exitCode = 1;
    console.error(error.message);
  } finally {
    if (context) await context.close();
    if (video) report.raw_video_path = path.relative(root, await video.path()).replaceAll('\\', '/');
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.writeFileSync(path.join(evidenceDir, dryRun ? 'preflight.json' : 'recording.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify(report, null, 2));
  }
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
