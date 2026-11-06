import { afterEach, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { vendorRuntime } from '../scripts/vendor-ort.mjs';

const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0)) {
    const resolved = path.resolve(directory);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('primer-runtime-test-')) {
      throw new Error('Unexpected cleanup path');
    }
    await fs.rm(resolved, {recursive: true, force: true});
  }
});
async function fixture() {
  const destination = await fs.mkdtemp(path.join(os.tmpdir(), 'primer-runtime-test-'));
  directories.push(destination);
  await fs.writeFile(path.join(destination, 'ort.wasm.min.mjs'), Buffer.alloc(49997, 32));
  await fs.writeFile(path.join(destination, 'ort-wasm-simd-threaded.mjs'), Buffer.alloc(24274, 32));
  const wasm = new Uint8Array(1024 * 1024);
  wasm.set([0, 97, 115, 109, 1, 0, 0, 0]);
  return {destination, wasm};
}

it('reuses downloaded JavaScript and tries the other source after a download error', async () => {
  const {destination, wasm} = await fixture();
  const fetchImpl = vi.fn().mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValueOnce(new Response(wasm, {headers: {'content-length': String(wasm.length)}}));
  await vendorRuntime({destination, fetchImpl, log: () => {}});
  expect(fetchImpl).toHaveBeenCalledTimes(2);
  expect(String(fetchImpl.mock.calls[0][0])).toContain('unpkg.com/onnxruntime-web@1.24.3');
  expect(String(fetchImpl.mock.calls[1][0])).toContain('cdn.jsdelivr.net');
  expect(await fs.readFile(path.join(destination, 'ort-wasm-simd-threaded.wasm'))).toEqual(Buffer.from(wasm));
  expect(JSON.parse(await fs.readFile(path.join(destination, 'manifest.json'), 'utf8')).version).toBe('1.24.3');
});

it('does not publish a manifest when the server returns HTML instead of WASM', async () => {
  const {destination} = await fixture();
  const fetchImpl = vi.fn(async () => new Response('<html>upstream error</html>'));
  await expect(vendorRuntime({destination, fetchImpl, log: () => {}})).rejects.toThrow();
  await expect(fs.stat(path.join(destination, 'manifest.json'))).rejects.toThrow();
  await expect(fs.stat(path.join(destination, 'ort-wasm-simd-threaded.wasm'))).rejects.toThrow();
});

it('rejects an incomplete body before publishing the file', async () => {
  const {destination, wasm} = await fixture();
  const fetchImpl = vi.fn(async () => new Response(wasm, {headers: {'content-length': String(wasm.length + 99)}}));
  await expect(vendorRuntime({destination, fetchImpl, log: () => {}})).rejects.toThrow();
  await expect(fs.stat(path.join(destination, 'manifest.json'))).rejects.toThrow();
});
