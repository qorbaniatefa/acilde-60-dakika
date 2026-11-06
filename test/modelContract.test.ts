import { afterEach, expect, it, vi } from 'vitest';
import policy from '../model-policy.json';
import { assertContract, resolveRuntimeBase, type ModelConfig } from '../src/ml/runtime';

afterEach(() => vi.unstubAllGlobals());

it('keeps the CDN fallback when the optional local runtime probe fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unavailable')));
  await expect(resolveRuntimeBase()).resolves.toBe('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/');
});

it('uses the local runtime only for a matching complete manifest', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true,
    headers: new Headers({'content-type': 'application/json'}), json: async () => ({version: '1.24.3'})}));
  await expect(resolveRuntimeBase('http://localhost:3000/?parite')).resolves.toBe('http://localhost:3000/ort/');
});

const contract = (): ModelConfig => ({schema_version: '2.0.0', features: policy.features,
  model_sha256: 'a'.repeat(64), class_labels: ['kisa_anlatim', 'derin_anlatim'],
  positive_class_index: 1, probability_threshold: .5, parity_tolerance: .0001,
  input: {name: 'features', dtype: 'float32', shape: [1, 6]}, output: {probabilities: 'probabilities'},
  release_eligible: false, evaluation_source: 'sentetik'});

it('rejects different feature order, range, class index and threshold before inference', () => {
  expect(() => assertContract(contract())).not.toThrow();
  for (const invalid of [
    {...contract(), features: [...policy.features].reverse()},
    {...contract(), positive_class_index: 0},
    {...contract(), probability_threshold: .4},
    {...contract(), model_sha256: 'invalid'},
    {...contract(), features: policy.features.map((f, i) => i === 0 ? {...f, maximum: 999} : f)},
  ]) expect(() => assertContract(invalid)).toThrow();
});
