// Fetch a fixed official runtime for self-hosting. No model/player data is sent.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const version = '1.24.3';
const filenames = ['ort.wasm.min.mjs', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm'];
const moduleSizes = {'ort.wasm.min.mjs': 49997, 'ort-wasm-simd-threaded.mjs': 24274};

function validFile(filename, bytes) {
  if (!filename.endsWith('.wasm')) return bytes.length === moduleSizes[filename];
  return bytes.length >= 1024 * 1024 && bytes.subarray(0, 8).equals(Buffer.from([0, 97, 115, 109, 1, 0, 0, 0]));
}

export async function vendorRuntime({
  destination = path.resolve(import.meta.dirname, '../public/ort'),
  fetchImpl = fetch,
  stallTimeoutMs = 30000,
  log = console.log,
} = {}) {
  await fs.mkdir(destination, {recursive: true});
  for (const filename of filenames) {
    const target = path.join(destination, filename);
    try {
      const cached = await fs.readFile(target);
      if (validFile(filename, cached)) {log(`Already downloaded ${filename}: ${cached.length} bytes`); continue;}
    } catch (error) {if (error.code !== 'ENOENT') throw error;}
    await fs.rm(path.join(destination, 'manifest.json'), {force: true});
    const cdn = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${version}/dist/${filename}`;
    const unpkg = `https://unpkg.com/onnxruntime-web@${version}/dist/${filename}`;
    // The large binary uses an independent CDN first; both sources pin 1.24.3.
    const urls = filename.endsWith('.wasm') ? [unpkg, cdn] : [cdn, unpkg];
    let lastError;
    let downloaded = false;
    for (const url of urls) {
      const controller = new AbortController();
      let timer;
      let handle;
      const temporary = `${target}.tmp`;
      const resetTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(() => controller.abort(), stallTimeoutMs);
      };
      try {
        log(`Downloading ${filename} from ${new URL(url).hostname}...`);
        resetTimer();
        const response = await fetchImpl(url, {signal: controller.signal});
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
        handle = await fs.open(temporary, 'w');
        let received = 0;
        let reported = 0;
        for await (const chunk of response.body) {
          resetTimer();
          await handle.writeFile(chunk);
          received += chunk.length;
          if (received - reported >= 1024 * 1024) {
            log(`${filename}: ${(received / 1024 / 1024).toFixed(1)} MB`);
            reported = received;
          }
        }
        await handle.close();
        handle = undefined;
        const length = response.headers.get('content-length');
        const encoding = response.headers.get('content-encoding');
        if (length && (!encoding || encoding === 'identity') && Number(length) !== received) {
          throw new Error('Incomplete download');
        }
        const bytes = await fs.readFile(temporary);
        if (!validFile(filename, bytes)) throw new Error('Invalid runtime file');
        await fs.rename(temporary, target);
        log(`${filename}: ${bytes.length} bytes`);
        downloaded = true;
        break;
      } catch (error) {
        lastError = error;
        if (handle) await handle.close();
        await fs.rm(temporary, {force: true});
        log(`Download failed (${error.message}); trying the next source if available.`);
      } finally {clearTimeout(timer);}
    }
    if (!downloaded) throw new Error(`${filename}: both download sources failed`, {cause: lastError});
  }
  // Publish readiness only after every file has been validated.
  await fs.writeFile(path.join(destination, 'manifest.json'), JSON.stringify({version, files: filenames}, null, 2) + '\n');
  log('Runtime ready.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {await vendorRuntime();}
  catch (error) {console.error(`Runtime download stopped: ${error.message}`); process.exitCode = 1;}
}
