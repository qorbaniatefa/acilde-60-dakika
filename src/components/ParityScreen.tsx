import { useState } from 'react';
import { predict } from '../ml/runtime';
import { DECISIONS } from '../game/storyData';
import type { FeatureVector } from '../ml/behavior';
import { AdaptiveSupport } from './AdaptiveSupport';

export function ParityScreen() {
  const [features, setFeatures] = useState<FeatureVector>([5, 0, 0, 0, 1, 1]);
  const [rows, setRows] = useState<{expected: number; actual: number; delta: number}[]>([]);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  async function run(file: string) {
    if (running) return;
    setRunning(true);
    setError(''); setRows([]);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}model/${file}`);
      if (!response.ok) throw new Error('Önce modeli eğitip Python oracle referanslarını üret.');
      const reference = await response.json();
      const results = [];
      for (const c of reference.cases) {
        const result = await predict(c.features);
        if (result.config.model_sha256 !== reference.model_sha256) throw new Error('Oracle farklı modele ait.');
        results.push({expected: c.p, actual: result.p, delta: Math.abs(c.p - result.p)});
      }
      setRows(results);
    } catch (e) {setError((e as Error).message);}
    finally {setRunning(false);}
  }
  return <main className="max-w-[480px] mx-auto px-4 py-6 space-y-4 text-[#dae2f9]">
    <h1 className="text-xl font-bold">Primer v2 — Model laboratuvarı</h1>
    <p>Bu ekran test/demo içindir. Gerçek oturum verisi üretmez.</p>
    <div className="flex gap-4">
      <button data-cy="demo-short" onClick={() => setFeatures([5, 0, 0, 0, 1, 1])} className="underline">Akıcı ilerleyen oyuncu</button>
      <button data-cy="demo-deep" onClick={() => setFeatures([90, 18, 0, 0, 1, 0])} className="underline">Düşünerek ilerleyen oyuncu</button>
    </div>
    <p>Aynı sahne: Yoğunluğu yönet · girdiler {features.join(', ')}</p>
    <AdaptiveSupport features={features} decision={DECISIONS[1]} collection={false} />
    <div className="flex gap-4">
      <button disabled={running} data-cy="parity-5" onClick={() => run('parite.json')} className="underline disabled:opacity-40">5 referansı çalıştır</button>
      <button disabled={running} data-cy="parity-300" onClick={() => run('parite-300.json')} className="underline disabled:opacity-40">300 girdiyi çalıştır</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {rows.length > 0 && <div data-cy="parity-results" data-count={rows.length}
      data-pass={rows.every(r => r.delta < .0001)}>
      {rows.map((r, i) => <p key={i} data-cy="parity-row" data-delta={r.delta}>
        {i + 1}: Python {r.expected.toFixed(8)} · Tarayıcı {r.actual.toFixed(8)} · Δ {r.delta.toExponential(2)}
      </p>)}
    </div>}
    <a href={import.meta.env.BASE_URL} className="underline">Hikâyeye dön</a>
  </main>;
}
