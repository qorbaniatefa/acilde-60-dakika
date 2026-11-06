// Encode the real browser recording with burned-in explanatory captions.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'docs/checks/2026-11-06-v2-demo');
const report = JSON.parse(fs.readFileSync(path.join(evidence, 'recording.json'), 'utf8'));
if (report.status !== 'recorded') throw new Error('A successful real browser recording is required.');
const cached = path.join(root, '.review-tools/cypress-cache/16.2.0/Cypress/resources/app/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
const ffmpeg = process.env.PRIMER_FFMPEG || (fs.existsSync(cached) ? cached : 'ffmpeg');
const relativeOutput = 'artifacts/demo/primer-v2-pilot.mp4';
const output = path.join(root, relativeOutput);
function run(argumentsList) {
  const result = spawnSync(ffmpeg, argumentsList, { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.slice(-5000));
  return result;
}
run(['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(report.trim_start_seconds),
  '-i', path.join(root, report.raw_video_path), '-t', String(report.duration_seconds),
  '-vf', 'pad=720:1080:0:0:color=0x0a1323,drawbox=x=0:y=0:w=720:h=42:color=0x0a1323:t=fill,subtitles=artifacts/demo/primer-v2-pilot.ass',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '25',
  '-movflags', '+faststart', '-an', output]);
const media = run(['-hide_banner', '-i', output, '-f', 'null', '-']).stderr;
const match = media.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
if (!match) throw new Error('Encoded duration could not be verified.');
const duration = Number((Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])).toFixed(2));
if (!(duration >= 60 && duration <= 90)) throw new Error(`Unexpected demo duration: ${duration}`);
if (!media.includes('720x1080')) throw new Error('Unexpected frame dimensions.');
for (const [name, time] of [['short', 10], ['deep', 24], ['parity', 37], ['story', 67]]) {
  run(['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(time), '-i', output,
    '-frames:v', '1', path.join(evidence, `encoded-${name}.png`)]);
}
const encoded = { status: 'encoded_and_decode_verified', path: relativeOutput,
  duration_seconds: duration, width: 720, height: 1080, audio: false,
  explanatory_captions: 'burned_in_Turkish', local_recording: true, synthetic_pilot: true,
  bytes: fs.statSync(output).size,
  sha256: createHash('sha256').update(fs.readFileSync(output)).digest('hex'),
  model_sha256: report.model_sha256, parity_checks: report.checks };
fs.writeFileSync(path.join(evidence, 'encoded.json'), JSON.stringify(encoded, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(encoded, null, 2));
