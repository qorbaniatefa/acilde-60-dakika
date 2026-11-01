import React from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  RotateCcw,
  Check,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import type { EndingResult } from '../types';

interface EndingScreenProps {
  ending: EndingResult;
  onRestart: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  ending,
  onRestart,
}) => {
  const isGood = ending.type === 'good';

  return (
    <main className="w-full max-w-[480px] mx-auto px-4 py-6 flex flex-col space-y-5">
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span
          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
            isGood
              ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30'
              : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30'
          }`}
        >
          {isGood ? (
            <ShieldCheck className="w-4 h-4" />
          ) : (
            <AlertOctagon className="w-4 h-4" />
          )}
          <span>{ending.subTitle}</span>
        </span>
      </div>

      {/* Main Title & Narrative */}
      <div className="space-y-2">
        <h1
          data-cy="ending"
          className="text-3xl font-extrabold tracking-tight text-[#dae2f9]"
        >
          {ending.title}
        </h1>
        <p className="text-base text-[#d6c3b1] leading-relaxed">
          {ending.narrative}
        </p>
      </div>

      {/* Fictional Shift Outcome Metrics */}
      <div className="p-3.5 rounded-lg bg-[#131c2c] border border-[#212a3b] space-y-2">
        <div className="text-[11px] font-mono text-[#9f8e7d] flex items-center justify-between">
          <span>KURGUSAL NÖBET TELEMETRİSİ</span>
          <span>SAAT: 21.00</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded bg-[#172030] border border-[#212a3b]">
            <div className="text-xs font-mono text-[#d6c3b1]">SİSTEM DURUMU</div>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                ending.isSystemStable ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
              }`}
            >
              {ending.isSystemStable ? 'KONTROLLÜ' : 'DARBOĞAZ VAR'}
            </div>
          </div>
          <div className="p-2.5 rounded bg-[#172030] border border-[#212a3b]">
            <div className="text-xs font-mono text-[#d6c3b1]">VERİ İHLALİ</div>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                ending.hasDataBreach ? 'text-[#ffb4ab]' : 'text-[#4edea3]'
              }`}
            >
              {ending.hasDataBreach ? 'İHLAL TESPİT EDİLDİ' : '0 KAYIT (TEMİZ)'}
            </div>
          </div>
        </div>
      </div>

      {/* Ece's Final Message */}
      <div className="p-3.5 rounded-lg bg-[#172030] border border-[#212a3b] flex items-start space-x-3">
        <div className="w-9 h-9 rounded-full bg-[#ffb454]/15 border border-[#ffb454]/30 flex flex-col items-center justify-center shrink-0 text-[#ffb454]">
          <span className="text-xs font-bold leading-none">E</span>
          <span className="text-[8px] font-mono mt-0.5">TRİYAJ</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-mono font-medium text-[#ffd8af]">
            Ece Yıldırım <span className="text-[10px] text-[#9f8e7d]">· Triyaj Amiri</span>
          </div>
          <p className="text-base text-[#dae2f9] italic leading-relaxed">
            {ending.eceFinalMessage}
          </p>
        </div>
      </div>

      {/* 3 Decisions Summary */}
      <section className="space-y-2.5" aria-label="3 Kararın Özeti">
        <div className="flex items-center justify-between text-xs font-mono text-[#ffd8af]">
          <span className="font-semibold uppercase tracking-wider">3 KARARIN ÖZETİ</span>
          <span className="text-[#9f8e7d]">SEVK_LOGU</span>
        </div>

        <div className="space-y-2">
          {ending.summaries.map((summary) => (
            <div
              key={summary.id}
              className="p-3 rounded-lg bg-[#172030] border border-[#212a3b] flex items-start justify-between space-x-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-1.5 text-xs font-mono text-[#ffd8af]">
                  <span>{summary.orderLabel}</span>
                  <span className="font-bold">{summary.title}</span>
                </div>
                <div className="text-sm text-[#dae2f9] leading-snug">
                  {summary.appliedText}
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 mt-0.5 ${
                  summary.isPositive
                    ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30'
                    : 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30'
                }`}
              >
                {summary.badgeText}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Key Learnings */}
      <section className="p-4 rounded-lg bg-[#131c2c] border border-[#212a3b] space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#ffd8af]">
          <Lightbulb className="w-4 h-4 text-[#ffb454]" />
          <span className="font-semibold uppercase tracking-wider">BU NÖBETTEN ÖĞRENDİĞİN</span>
        </div>

        <div className="space-y-2.5">
          {ending.keyLearnings.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 text-sm">
              <span className="w-4 h-4 rounded-full bg-[#4edea3]/15 text-[#4edea3] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <div className="space-y-0.5">
                <div className="font-semibold text-[#ffd8af]">{item.title}</div>
                <p className="text-xs text-[#d6c3b1] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Restart Action */}
      <div className="pt-2 space-y-2">
        <button
          type="button"
          data-cy="restart"
          onClick={onRestart}
          className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-[#ffb454] text-[#734600] font-bold text-base flex items-center justify-center space-x-2 transition-all hover:bg-[#ffa733] shadow-lg shadow-[#ffb454]/10 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeniden Oyna</span>
        </button>

        <p className="text-xs font-mono text-center text-[#9f8e7d]">
          Aynı hikâyeyi farklı kararlarla yeniden oyna.
        </p>
      </div>
    </main>
  );
};
