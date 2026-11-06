import { csvExport, type DecisionRecord } from '../ml/behavior';

export function CollectionPanel({consent, onConsent, records, onClear, canChange}: {
  consent: boolean; onConsent: (value: boolean) => void; records: DecisionRecord[]; onClear: () => void; canChange: boolean;
}) {
  const download = () => {
    const url = URL.createObjectURL(new Blob(['\uFEFF', csvExport(records)], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'primer-gercek-oturumlar.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <aside className="w-full max-w-[480px] mx-auto px-4 py-3 text-sm text-[#d6c3b1] space-y-2">
    {canChange && <label className="flex gap-2 items-start">
      <input type="checkbox" data-cy="collection-consent" checked={consent} onChange={e => onConsent(e.target.checked)} className="mt-1" />
      <span>Veri toplama moduna gönüllü katılıyorum. Yalnız rastgele oturum kimliği, sayısal davranışlar ve açıklama tercihim kaydedilir. Yazdığım metin kaydedilmez; veriler bu sekmede kalır ve yalnız CSV indirince dışa çıkar.</span>
    </label>}
    <p data-cy="collection-count">Tamamlanan gerçek oturum: {records.length / 3} / 15</p>
    <p className="text-xs">Sekmeyi kapatınca veriler silinir. CSV'yi indirmeyi unutma. Test ve demo koşularını gerçek veri olarak kullanma.</p>
    <div className="flex gap-3">
      <button type="button" data-cy="download-data" disabled={!records.length} onClick={download} className="underline disabled:opacity-40">CSV indir</button>
      <button type="button" disabled={!records.length} onClick={onClear} className="underline disabled:opacity-40">Bellekteki verileri sil</button>
    </div>
  </aside>;
}
