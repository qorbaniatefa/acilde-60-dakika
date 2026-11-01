import React, { useEffect, useRef } from 'react';

interface HeaderProps {
  currentDecisionId?: number;
  totalDecisions?: number;
  title?: string;
  isScene?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDecisionId = 1,
  totalDecisions = 3,
  title,
  isScene = false,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (isScene) headingRef.current?.focus({ preventScroll: true });
  }, [isScene, currentDecisionId]);
  return (
    <header className="w-full border-b border-[#212a3b] bg-[#0a1323]/95 backdrop-blur-sm sticky top-0 z-20 px-4 py-3">
      <div className="max-w-[480px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#ffb454] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#ffd8af]">
            GECE NÖBETİ · 20.00
          </span>
        </div>

        {isScene ? (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-[#d6c3b1]">
              KARAR <strong className="text-[#ffd8af]">{currentDecisionId}</strong> / {totalDecisions}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#212a3b] text-[#4edea3] border border-[#2c3546]">
              SİMÜLASYON AKTİF
            </span>
          </div>
        ) : (
          <div className="font-mono text-xs text-[#d6c3b1]">
            NÖBETÇİ MÜHENDİS
          </div>
        )}
      </div>

      {isScene && (
        <div className="max-w-[480px] mx-auto mt-2">
          {/* Progress bar */}
          <div className="w-full bg-[#172030] h-1 rounded-full overflow-hidden flex">
            <div
              className="bg-[#ffb454] h-full transition-all duration-300"
              style={{ width: `${(currentDecisionId / totalDecisions) * 100}%` }}
            />
          </div>
          {title && (
            <div className="mt-2 flex items-center justify-between">
              <h1 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-[#dae2f9]">{title}</h1>
              <span className="text-xs font-mono text-[#d6c3b1] bg-[#172030] px-2 py-0.5 rounded">
                BÖLÜM {currentDecisionId}
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
