import policy from '../../model-policy.json';
import { FEATURE_NAMES, type FeatureVector } from './behavior';

export interface ModelConfig {
  schema_version: string;
  features: {name: string; minimum: number; maximum: number}[];
  model_sha256: string;
  class_labels: string[];
  positive_class_index: number;
  probability_threshold: number;
  parity_tolerance: number;
  input: {name: string; dtype: string; shape: number[]};
  output: {probabilities: string};
  release_eligible: boolean;
  evaluation_source: string;
}
interface OrtSession {
  run(feeds: Record<string, unknown>): Promise<Record<string, {data: ArrayLike<number>; dims: number[]}>>;
}
interface OrtModule {
  env: {wasm: {numThreads: number; wasmPaths: string; proxy: boolean}};
  Tensor: new (type: string, data: Float32Array, dims: number[]) => unknown;
  InferenceSession: {create(data: ArrayBuffer, options: object): Promise<OrtSession>};
}
const RUNTIME_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';
const BASE = import.meta.env.BASE_URL;
let pending: Promise<{config: ModelConfig; session: OrtSession; ort: OrtModule}> | undefined;

export function assertContract(c: ModelConfig) {
  if (c.schema_version !== '2.0.0' || c.input?.dtype !== 'float32'
      || JSON.stringify(c.input.shape) !== '[1,6]' || c.input.name !== 'features'
      || c.positive_class_index !== 1 || c.probability_threshold !== .5 || c.parity_tolerance !== .0001
      || JSON.stringify(c.class_labels) !== '["kisa_anlatim","derin_anlatim"]'
      || !/^[a-f0-9]{64}$/.test(c.model_sha256) || typeof c.output?.probabilities !== 'string'
      || JSON.stringify(c.features?.map(f => f.name)) !== JSON.stringify(FEATURE_NAMES)
      || c.features.some((f, i) => f.minimum !== policy.features[i].minimum || f.maximum !== policy.features[i].maximum)) {
    throw new Error('Model sözleşmesi uyuşmuyor.');
  }
}

async function fetchChecked(url: string) {
  const response = await fetch(url, {signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error(`Model dosyası yüklenemedi (${response.status}).`);
  return response;
}

export async function resolveRuntimeBase(pageUrl?: string) {
  try {
    const response = await fetch(`${BASE}ort/manifest.json`, {signal: AbortSignal.timeout(5000)});
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const manifest = await response.json();
      // Vite adds ?import to root-relative dynamic imports, then rejects
      // public JavaScript as source. An absolute URL stays a native import.
      if (manifest.version === '1.24.3') return new URL(`${BASE}ort/`, pageUrl ?? window.location.href).href;
    }
  } catch {
    // An optional local probe must not disable the existing CDN runtime.
  }
  return RUNTIME_BASE;
}

async function load() {
  const release = await (await fetchChecked(`${BASE}model-release.json`)).json();
  let configUrl = `${BASE}model/config.json`;
  let modelUrl = `${BASE}model/model.onnx`;
  if (release.source === 'huggingface') {
    if (!/^[a-f0-9]{40}$/.test(release.revision) || !/^[\w-]+\/[\w.-]+$/.test(release.repo)) {
      throw new Error('Hugging Face sürümü tam commit SHA olmalı.');
    }
    configUrl = `https://huggingface.co/${release.repo}/resolve/${release.revision}/config.json`;
    modelUrl = `https://huggingface.co/${release.repo}/resolve/${release.revision}/model.onnx`;
  } else if (release.source !== 'local') throw new Error('Bilinmeyen model kaynağı.');
  const config: ModelConfig = await (await fetchChecked(configUrl)).json();
  assertContract(config);
  const bytes = await (await fetchChecked(modelUrl)).arrayBuffer();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  if (hash !== config.model_sha256) throw new Error('Model bütünlük kontrolü başarısız.');
  const runtimeBase = await resolveRuntimeBase();
  const moduleUrl = `${runtimeBase}ort.wasm.min.mjs`;
  const ort: OrtModule = await import(/* @vite-ignore */ moduleUrl);
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;
  ort.env.wasm.wasmPaths = runtimeBase;
  const session = await ort.InferenceSession.create(bytes, {executionProviders: ['wasm']});
  return {config, session, ort};
}

export async function predict(features: FeatureVector) {
  for (const [i, value] of features.entries()) {
    if (!Number.isFinite(value) || value < policy.features[i].minimum || value > policy.features[i].maximum) {
      throw new Error('Model girdisi aralık dışında.');
    }
  }
  if (features.length !== 6) throw new Error('Altı özellik gerekli.');
  if (!pending) {
    pending = (async () => {
      let timer: ReturnType<typeof setTimeout>;
      try {
        return await Promise.race([load(), new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Model yükleme zaman aşımı.')), 20000);
        })]);
      } finally { clearTimeout(timer!); }
    })().catch(error => { pending = undefined; throw error; });
  }
  const {config, session, ort} = await pending;
  const result = await session.run({[config.input.name]: new ort.Tensor('float32', new Float32Array(features), [1, 6])});
  const output = result[config.output.probabilities];
  if (!output || output.dims.join(',') !== '1,2') throw new Error('Model çıkış boyutu geçersiz.');
  const p = Number(output.data[config.positive_class_index]);
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new Error('Geçersiz model olasılığı.');
  return {p, support: p >= config.probability_threshold, config};
}
