import { useEffect, useState } from 'react';
import { predict } from '../ml/runtime';
import type { FeatureVector } from '../ml/behavior';
import type { DecisionDefinition } from '../types';

export function AdaptiveSupport({features, decision, collection}: {
  features: FeatureVector; decision: DecisionDefinition; collection: boolean;
}) {
  const [state, setState] = useState<{key: string; result?: Awaited<ReturnType<typeof predict>>; error?: boolean} | null>(null);
  const key = features.join(',');
  const result = state?.key === key ? state.result : undefined;
  const error = state?.key === key && state.error;
  useEffect(() => {
    if (collection) return;
    let active = true;
    predict(features).then(result => {if (active) setState({key, result});})
      .catch(() => {if (active) setState({key, error: true});});
    return () => {active = false;};
  }, [key, collection]);
  if (collection) return <p className="text-xs text-[#d6c3b1]">Veri toplama modu: model desteği bu oturumda kapalı.</p>;
  return <section data-cy="model-status" className="rounded-lg border border-[#4edea3]/30 p-3.5 bg-[#131c2c] text-sm space-y-2">
    <h3 className="font-bold text-[#4edea3]">Sana uyarlanan anlatım</h3>
    {error ? <p>Model kullanılamıyor. Hikâyeye ve öğretmene devam edebilirsin.</p>
      : !result ? <p>Öğrenme desteği hazırlanıyor…</p> : <>
        <p>{result.support ? 'Birlikte biraz daha derine bakalım.' : 'Kısa anlatımla devam edebilirsin.'}</p>
        {result.support && <div data-cy="adaptive-hint" className="space-y-2">
          <p>{decision.beginnerThinkingPrompt}</p>
          {decision.beginnerTerminology && <p><strong>{decision.beginnerTerminology.term}: </strong>{decision.beginnerTerminology.definition}</p>}
        </div>}
        <details className="text-xs text-[#d6c3b1]"><summary>Model bilgisi</summary>
          <p>Derin anlatım olasılığı: <output data-cy="p">{result.p.toFixed(8)}</output></p>
          <p>{result.config.release_eligible ? 'Gerçek oturumlarla değerlendirildi.' : 'Sentetik pilot; gerçek kullanıcı başarısı henüz ölçülmedi.'}</p>
        </details>
      </>}
  </section>;
}
