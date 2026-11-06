import React, { useState, useEffect, useRef } from 'react';
import { AdaptiveSupport } from './AdaptiveSupport';
import { buildFeatures, recordDecision, type DecisionRecord, type FeatureVector } from '../ml/behavior';
import {
  MessageSquare,
  Server,
  Activity,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import type {
  DecisionDefinition,
  UserProfile,
  ChoiceOption,
  DecisionChoices,
} from '../types';

interface SceneScreenProps {
  decision: DecisionDefinition;
  profile: UserProfile;
  choices: DecisionChoices;
  isChoiceLocked: boolean;
  onMakeChoice: (choice: ChoiceOption) => void;
  onContinue: () => void;
  collectionConsent: boolean;
  sessionId: string;
  onRecord: (row: DecisionRecord) => void;
  hintRequests: number;
  onTutorRequest: () => void;
}

export const SceneScreen: React.FC<SceneScreenProps> = ({
  decision,
  profile,
  choices,
  isChoiceLocked,
  onMakeChoice,
  onContinue,
  collectionConsent,
  sessionId,
  onRecord,
  hintRequests,
  onTutorRequest,
}) => {
  const currentChoice = choices[decision.id];
  const [elapsed, setElapsed] = useState(0);
  const edits = useRef(0);
  const previousHints = useRef(hintRequests);
  const startedAt = useRef(performance.now());
  const [pendingChoice, setPendingChoice] = useState<ChoiceOption | null>(null);
  const snapshot = useRef<FeatureVector | null>(null);
  const features = snapshot.current ?? buildFeatures(elapsed, edits.current, choices, previousHints.current, decision.id, profile.level);
  useEffect(() => {
    if (isChoiceLocked || pendingChoice) return;
    const timer = setInterval(() => setElapsed(Math.min(180, Math.round((performance.now() - startedAt.current) / 1000))), 2000);
    return () => clearInterval(timer);
  }, [isChoiceLocked, pendingChoice]);
  const choose = (choice: ChoiceOption) => {
    if (isChoiceLocked || pendingChoice) return;
    snapshot.current = buildFeatures(Math.round((performance.now() - startedAt.current) / 1000 * 100) / 100,
      edits.current, choices, previousHints.current, decision.id, profile.level);
    if (collectionConsent) setPendingChoice(choice);
    else onMakeChoice(choice);
  };
  const labelDecision = (label: 0 | 1) => {
    if (!pendingChoice || !snapshot.current) return;
    const row = recordDecision(collectionConsent, sessionId, snapshot.current, label);
    if (row) onRecord(row);
    onMakeChoice(pendingChoice);
    setPendingChoice(null);
  };

  // AI Tutor state
  const [thoughtInput, setThoughtInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [tutorError, setTutorError] = useState<string | null>(null);

  // AbortController ref for tutor requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(true);

  // Clean up tutor request on decision/scene change
  useEffect(() => {
    activeRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setThoughtInput('');
    setTutorLoading(false);
    setTutorResponse(null);
    setTutorError(null);
    return () => {
      activeRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [decision.id]);

  // Scroll to feedback when choice is made
  useEffect(() => {
    if (isChoiceLocked && feedbackRef.current) {
      const timer = setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isChoiceLocked]);

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = thoughtInput.trim();
    if (!clean || clean.length > 2000 || tutorLoading) return;
    onTutorRequest();

    // Cancel existing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setTutorLoading(true);
    setTutorError(null);
    setTutorResponse(null);

    // 15 second timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          decisionId: decision.id,
          profile,
          thought: clean,
        }),
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      if (!activeRef.current || controller.signal.aborted) return;
      if (data.tutorResponse) {
        setTutorResponse(data.tutorResponse);
      } else {
        throw new Error('No response body');
      }
    } catch (err: unknown) {
      if (!activeRef.current) return;
      if ((err as Error)?.name === 'AbortError') {
        setTutorError('Öğretmene ulaşılamadı (zaman aşımı). Tekrar deneyebilir veya kararına devam edebilirsin.');
      } else {
        setTutorError('Öğretmene ulaşılamadı. Tekrar deneyebilir veya kararına devam edebilirsin.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (activeRef.current && abortControllerRef.current === controller) {
        setTutorLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const outcome = currentChoice
    ? decision.getOutcome(currentChoice, choices, profile.goal)
    : null;

  return (
    <main className="w-full max-w-[480px] mx-auto px-4 py-5 flex flex-col space-y-5">
      {/* Dialogue Stream */}
      <section className="space-y-3" aria-label="Nöbetçi İletişim Kanalı">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-[#d6c3b1] uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-[#ffb454]" />
          <span>NÖBETÇİ İLETİŞİM KANALI</span>
        </div>

        {/* Ece Dialogue */}
        <div className="p-3.5 rounded-lg bg-[#172030] border border-[#212a3b] flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#ffb454]/15 border border-[#ffb454]/30 flex flex-col items-center justify-center shrink-0 text-[#ffb454]">
            <span className="text-xs font-bold leading-none">E</span>
            <span className="text-[8px] font-mono mt-0.5">TRİYAJ</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-medium text-[#ffd8af] flex items-center space-x-2">
              <span>Ece Yıldırım</span>
              <span className="text-[10px] text-[#9f8e7d]">Triyaj Amiri</span>
            </div>
            <p className="text-base text-[#dae2f9] leading-relaxed">
              {decision.eceDialogue}
            </p>
          </div>
        </div>

        {/* Deniz Dialogue */}
        <div className="p-3.5 rounded-lg bg-[#172030] border border-[#212a3b] flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#4edea3]/15 border border-[#4edea3]/30 flex flex-col items-center justify-center shrink-0 text-[#4edea3]">
            <span className="text-xs font-bold leading-none">D</span>
            <span className="text-[8px] font-mono mt-0.5">SRE</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-medium text-[#4edea3] flex items-center space-x-2">
              <span>Deniz Kaya</span>
              <span className="text-[10px] text-[#9f8e7d]">Kıdemli Mühendis</span>
            </div>
            <p className="text-base text-[#dae2f9] leading-relaxed">
              {decision.denizDialogue}
            </p>
          </div>
        </div>
      </section>

      {/* Technical Context & Role Perspective */}
      <section className="space-y-2.5">
        <div className="p-3.5 rounded-lg bg-[#131c2c] border border-[#212a3b] space-y-2">
          <div className="text-xs font-mono font-semibold text-[#ffd8af] flex items-center space-x-1.5 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5 text-[#ffb454]" />
            <span>TEKNİK BAĞLAM ({decision.topicLabel})</span>
          </div>
          <p className="text-base text-[#dae2f9] leading-relaxed">
            {decision.technicalContext}
          </p>

          {/* Role-specific perspective note */}
          <div className="pt-2 border-t border-[#212a3b]/60 flex items-start space-x-2 text-base text-[#d6c3b1]">
            <UserCheck className="w-4 h-4 text-[#ffb454] shrink-0 mt-0.5" />
            <p className="leading-normal">
              {profile.role === 'developer'
                ? decision.rolePerspectiveNote.developer
                : decision.rolePerspectiveNote.tester}
            </p>
          </div>
        </div>

        {/* Beginner Explainer & Thinking Prompt (Only for Beginners) */}
        {profile.level === 'beginner' && decision.beginnerTerminology && (
          <div className="p-3.5 rounded-lg bg-[#172030] border border-[#ffb454]/25 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-mono text-[#ffd8af]">
              <HelpCircle className="w-3.5 h-3.5 text-[#ffb454]" />
              <span className="font-semibold uppercase">YENİ BAŞLAYAN İÇİN TERİM</span>
            </div>
            <div className="text-base text-[#dae2f9] leading-relaxed">
              <strong className="text-[#ffd8af]">{decision.beginnerTerminology.term}: </strong>
              {decision.beginnerTerminology.definition}
            </div>
            <div className="pt-1.5 border-t border-[#212a3b] text-base text-[#d6c3b1] italic">
              💡 Düşünme Sorusu: {decision.beginnerThinkingPrompt}
            </div>
          </div>
        )}
      </section>

      {/* Telemetry Report Card */}
      <section className="p-3.5 rounded-lg bg-[#131c2c] border border-[#212a3b] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center space-x-1 text-[#ffd8af] uppercase">
            <Activity className="w-3.5 h-3.5 text-[#ffb454]" />
            <span>TELEMETRİ RAPORU</span>
          </span>
          <span className="text-[#9f8e7d]">SYS-ENG #{decision.id * 104}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded bg-[#172030] border border-[#212a3b]">
            <div className="text-xs font-mono text-[#d6c3b1]">{decision.telemetry.label1}</div>
            <div className="text-lg font-bold text-[#ffd8af] flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb454]" />
              <span>{decision.telemetry.value1}</span>
            </div>
            {decision.telemetry.sub1 && (
              <div className="text-xs font-mono text-[#9f8e7d] mt-0.5">{decision.telemetry.sub1}</div>
            )}
          </div>

          <div className="p-2.5 rounded bg-[#172030] border border-[#212a3b]">
            <div className="text-xs font-mono text-[#d6c3b1]">{decision.telemetry.label2}</div>
            <div className="text-lg font-bold text-[#ffd8af] flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb454]" />
              <span>{decision.telemetry.value2}</span>
            </div>
            {decision.telemetry.sub2 && (
              <div className="text-xs font-mono text-[#9f8e7d] mt-0.5">{decision.telemetry.sub2}</div>
            )}
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#9f8e7d] text-center pt-1">
          {decision.telemetry.note}
        </div>
      </section>

      {/* Decision Choice Actions */}
      <AdaptiveSupport features={features} decision={decision} collection={collectionConsent} />
      <section className="space-y-3 pt-1">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#ffd8af]">
            EYLEMSEL SEÇİM
          </div>
          <h2 className="text-lg font-bold text-[#dae2f9]">
            {decision.question}
          </h2>
        </div>

        <div className="space-y-2.5">
          {/* Option A */}
          <button
            type="button"
            data-cy="choice-A"
            onClick={() => choose('A')}
            disabled={isChoiceLocked || Boolean(pendingChoice)}
            className={`w-full min-h-[56px] p-3.5 rounded-lg border text-left transition-all flex items-start space-x-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af] ${
              currentChoice === 'A'
                ? 'bg-[#2c3546] border-[#ffb454] ring-2 ring-[#ffb454] text-[#ffd8af]'
                : isChoiceLocked
                ? 'bg-[#131c2c] border-[#212a3b] text-[#9f8e7d] opacity-50 cursor-not-allowed'
                : 'bg-[#212a3b] border-[#2c3546] text-[#dae2f9] hover:bg-[#2c3546] hover:border-[#ffb454]/50 cursor-pointer active:scale-[0.99]'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-md font-mono font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 ${
                currentChoice === 'A'
                  ? 'bg-[#ffb454] text-[#734600]'
                  : 'bg-[#172030] text-[#ffd8af] border border-[#2c3546]'
              }`}
            >
              A
            </span>
            <div className="space-y-1 flex-1">
              <div className="text-base font-medium leading-snug">
                {decision.choices.A.text}
              </div>
              <div className="text-xs font-mono text-[#d6c3b1]">
                {decision.choices.A.tacticalBadge}
              </div>
            </div>
          </button>

          {/* Option B */}
          <button
            type="button"
            data-cy="choice-B"
            onClick={() => choose('B')}
            disabled={isChoiceLocked || Boolean(pendingChoice)}
            className={`w-full min-h-[56px] p-3.5 rounded-lg border text-left transition-all flex items-start space-x-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af] ${
              currentChoice === 'B'
                ? 'bg-[#2c3546] border-[#ffb454] ring-2 ring-[#ffb454] text-[#ffd8af]'
                : isChoiceLocked
                ? 'bg-[#131c2c] border-[#212a3b] text-[#9f8e7d] opacity-50 cursor-not-allowed'
                : 'bg-[#212a3b] border-[#2c3546] text-[#dae2f9] hover:bg-[#2c3546] hover:border-[#ffb454]/50 cursor-pointer active:scale-[0.99]'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-md font-mono font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 ${
                currentChoice === 'B'
                  ? 'bg-[#ffb454] text-[#734600]'
                  : 'bg-[#172030] text-[#ffd8af] border border-[#2c3546]'
              }`}
            >
              B
            </span>
            <div className="space-y-1 flex-1">
              <div className="text-base font-medium leading-snug">
                {decision.choices.B.text}
              </div>
              <div className="text-xs font-mono text-[#d6c3b1]">
                {decision.choices.B.tacticalBadge}
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Socratic AI Tutor Card */}
      {pendingChoice && <section data-cy="support-label" className="rounded-lg border border-[#ffb454] p-4 space-y-3">
        <h3 className="font-bold">Sonucu görmeden önce</h3>
        <p>Bu sahnede daha ayrıntılı bir açıklama ister miydin?</p>
        <div className="flex gap-4">
          <button data-cy="label-yes" onClick={() => labelDecision(1)} className="underline">Evet</button>
          <button data-cy="label-no" onClick={() => labelDecision(0)} className="underline">Hayır</button>
        </div>
        <p className="text-xs">Doğru veya yanlış yanıt yok; yalnız öğrenme tercihin ölçülür.</p>
      </section>}
      <section className="p-4 rounded-lg bg-[#172030] border border-[#212a3b] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#ffb454]" />
            <h3 className="text-sm font-bold text-[#dae2f9]">AI Öğretmenin</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131c2c] text-[#ffd8af] border border-[#2c3546]">
            SOKRATİK MOD
          </span>
        </div>

        <p className="text-xs text-[#d6c3b1]">
          Cevabı söylemez, düşünmene yardımcı olur.
        </p>

        <form onSubmit={handleAskTutor} className="space-y-2.5">
          <div className="space-y-1">
            <label
              htmlFor={`tutor-input-${decision.id}`}
              className="text-xs font-mono text-[#d6c3b1] block"
            >
              Düşünce Defteri:
            </label>
            <textarea
              id={`tutor-input-${decision.id}`}
              data-cy="tutor-input"
              rows={2}
              maxLength={2000}
              value={thoughtInput}
              onChange={(e) => {edits.current = Math.min(60, edits.current + 1); setThoughtInput(e.target.value);}}
              placeholder="Nasıl düşündüğünü yaz..."
              className="w-full p-2.5 rounded-lg bg-[#2c3546] border border-[#212a3b] text-[#dae2f9] placeholder-[#9f8e7d] text-base focus:border-[#ffb454] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffb454] resize-none"
            />
            <div className="flex justify-between items-center text-[11px] font-mono text-[#9f8e7d]">
              <span>Gerekçeni paylaşarak Sokratik ipucu alabilirsin.</span>
              <span>{thoughtInput.length}/2000</span>
            </div>
          </div>

          <button
            type="submit"
            data-cy="tutor-submit"
            disabled={tutorLoading || !thoughtInput.trim()}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af] ${
              tutorLoading || !thoughtInput.trim()
                ? 'bg-[#212a3b] text-[#9f8e7d] border border-[#2c3546] cursor-not-allowed opacity-60'
                : 'bg-[#ffb454]/15 border border-[#ffb454]/50 text-[#ffd8af] hover:bg-[#ffb454]/25 cursor-pointer active:scale-[0.98]'
            }`}
          >
            {tutorLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#ffb454]" />
                <span>Öğretmen Düşünüyor...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 text-[#ffb454]" />
                <span>İpucu iste</span>
              </>
            )}
          </button>
        </form>

        {/* Tutor Response */}
        {tutorResponse && (
          <div className="p-3 rounded-lg bg-[#131c2c] border border-[#ffb454]/30 space-y-1.5 animate-fadeIn">
            <div className="flex items-center space-x-1.5 text-xs font-mono text-[#ffd8af]">
              <Lightbulb className="w-3.5 h-3.5 text-[#ffb454]" />
              <span className="font-semibold">Öğretmenin Sorusu:</span>
            </div>
            <p className="text-base text-[#dae2f9] leading-relaxed">
              “{tutorResponse}”
            </p>
          </div>
        )}

        {/* Tutor Error */}
        {tutorError && (
          <div
            data-cy="tutor-error"
            className="p-3 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-start space-x-2 text-xs text-[#ffb4ab]"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#ffb4ab]" />
            <div className="space-y-1">
              <p className="leading-snug">{tutorError}</p>
              <button
                type="button"
                onClick={handleAskTutor}
                className="font-mono underline text-[#ffd8af] hover:text-[#ffb454] cursor-pointer"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Feedback Section: STRICTLY only in DOM AFTER choice is locked */}
      {isChoiceLocked && outcome && (
        <section
          ref={feedbackRef}
          className="p-4 rounded-lg bg-[#172030] border border-[#212a3b] space-y-3.5 animate-fadeIn"
          aria-label="Müdahale Analizi"
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-[#4edea3]">
              <CheckCircle2 className="w-4 h-4" />
              <strong className="tracking-wider">MÜDAHALE ANALİZİ</strong>
            </span>
            <span className="text-[#9f8e7d]">LOG #0{decision.id} KAYDEDİLDİ</span>
          </div>

          {/* NE OLDU? */}
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#ffd8af] font-semibold tracking-wide">
              NE OLDU?
            </div>
            <p
              data-cy="feedback-what"
              className="text-base text-[#dae2f9] leading-relaxed bg-[#131c2c] p-3 rounded border border-[#212a3b]"
            >
              {outcome.whatHappened}
            </p>
          </div>

          {/* NEDEN OLDU? */}
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[#4edea3] font-semibold tracking-wide">
              NEDEN OLDU?
            </div>
            <p
              data-cy="feedback-why"
              className="text-base text-[#dae2f9] leading-relaxed bg-[#131c2c] p-3 rounded border border-[#212a3b]"
            >
              {outcome.whyHappened}
            </p>
          </div>

          {/* Continue Action */}
          <div className="pt-2">
            <button
              type="button"
              data-cy="continue"
              onClick={onContinue}
              className="w-full min-h-[48px] px-4 py-3 rounded-lg bg-[#ffb454] text-[#734600] font-bold text-base flex items-center justify-center space-x-2 transition-all hover:bg-[#ffa733] shadow-lg shadow-[#ffb454]/10 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd8af]"
            >
              <span>{decision.id === 3 ? 'Sonuçları Gör' : 'Devam'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}
    </main>
  );
};
