import { describe, it, expect } from 'vitest';
import {
  evaluateEnding,
  canStartShift,
  getNextDecisionState,
  advanceToNextStep,
  createInitialGameState,
} from '../src/game/engine';
import { DECISIONS } from '../src/game/storyData';
import { getSceneContextForTutor, SYSTEM_INSTRUCTION } from '../server/geminiTutorPrompt';
import type { UserProfile, DecisionChoices } from '../src/types';

describe('Acilde 60 Dakika - Game Engine Rules', () => {
  const completeProfile: UserProfile = {
    level: 'beginner',
    role: 'developer',
    goal: 'architecture',
  };

  describe('Profile and Start Validation', () => {
    it('prevents starting shift when profile is incomplete', () => {
      expect(canStartShift({ level: null, role: null, goal: null })).toBe(false);
      expect(canStartShift({ level: 'beginner', role: null, goal: null })).toBe(false);
      expect(canStartShift({ level: 'beginner', role: 'developer', goal: null })).toBe(false);
      expect(canStartShift({ level: null, role: 'tester', goal: 'security' })).toBe(false);
    });

    it('allows starting shift when all three profile fields are selected', () => {
      expect(canStartShift(completeProfile)).toBe(true);
    });
  });

  describe('Ending Calculation (All 8 Decision Paths)', () => {
    it('A-A-A yields the Good Ending: "Nöbet Kontrol Altında"', () => {
      const choices: DecisionChoices = { 1: 'A', 2: 'A', 3: 'A' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('good');
      expect(result.title).toBe('Nöbet Kontrol Altında');
      expect(result.isSystemStable).toBe(true);
      expect(result.hasDataBreach).toBe(false);
      expect(result.hasUnverifiedTesting).toBe(false);
      expect(result.hasCapacityIssue).toBe(false);
    });

    it('A-A-B yields Bad Ending explaining only data privacy breach without capacity crash', () => {
      const choices: DecisionChoices = { 1: 'A', 2: 'A', 3: 'B' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('bad');
      expect(result.title).toBe('Krizin Bedeli');
      expect(result.hasCapacityIssue).toBe(false);
      expect(result.hasUnverifiedTesting).toBe(false);
      expect(result.hasDataBreach).toBe(true);
      // Explains system is running stably, but data was breached
      expect(result.narrative).toContain('Sistem kontrollü çalışıyor');
      expect(result.narrative).toContain('kişisel veri');
      expect(result.narrative).not.toContain('kapasite çöküşü');
    });

    it('A-B-A yields Bad Ending explaining unverified testing without fabricating data breach', () => {
      const choices: DecisionChoices = { 1: 'A', 2: 'B', 3: 'A' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('bad');
      expect(result.hasCapacityIssue).toBe(false);
      expect(result.hasUnverifiedTesting).toBe(true);
      expect(result.hasDataBreach).toBe(false);
      expect(result.narrative).toContain('doğrulanmadan');
      expect(result.narrative).not.toContain('veri ihlali');
    });

    it('A-B-B yields Bad Ending with test skipped and data breach', () => {
      const choices: DecisionChoices = { 1: 'A', 2: 'B', 3: 'B' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('bad');
      expect(result.hasCapacityIssue).toBe(false);
      expect(result.hasUnverifiedTesting).toBe(true);
      expect(result.hasDataBreach).toBe(true);
    });

    it('B-A-A yields Bad Ending reporting capacity overload from step 1', () => {
      const choices: DecisionChoices = { 1: 'B', 2: 'A', 3: 'A' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('bad');
      expect(result.hasCapacityIssue).toBe(true);
      expect(result.hasDataBreach).toBe(false);
      expect(result.narrative).toContain('kapasite');
    });

    it('B-A-B yields Bad Ending with capacity overload and data breach', () => {
      const choices: DecisionChoices = { 1: 'B', 2: 'A', 3: 'B' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('bad');
      expect(result.hasCapacityIssue).toBe(true);
      expect(result.hasDataBreach).toBe(true);
    });

    it('B-B-A yields Bad Ending with capacity overload and test skipped', () => {
      const choices: DecisionChoices = { 1: 'B', 2: 'B', 3: 'A' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('bad');
      expect(result.hasCapacityIssue).toBe(true);
      expect(result.hasUnverifiedTesting).toBe(true);
      expect(result.hasDataBreach).toBe(false);
    });

    it('B-B-B yields Bad Ending with all three mistakes', () => {
      const choices: DecisionChoices = { 1: 'B', 2: 'B', 3: 'B' };
      const result = evaluateEnding(choices);
      expect(result.type).toBe('bad');
      expect(result.hasCapacityIssue).toBe(true);
      expect(result.hasUnverifiedTesting).toBe(true);
      expect(result.hasDataBreach).toBe(true);
    });
  });

  describe('Decision Locking, Progression and Flow', () => {
    it('locks choice once chosen and prevents changing in the same scene', () => {
      const state = createInitialGameState();
      state.profile = completeProfile;
      state.screen = 'scene';
      state.currentDecisionId = 1;

      // Select choice A
      const updated = getNextDecisionState(state, 'A');
      expect(updated.choices[1]).toBe('A');
      expect(updated.isChoiceLocked).toBe(true);

      // Attempting to select B when locked preserves A
      const lockedAttempt = getNextDecisionState(updated, 'B');
      expect(lockedAttempt.choices[1]).toBe('A');
      expect(lockedAttempt.isChoiceLocked).toBe(true);
    });

    it('advances sequentially through decisions 1 -> 2 -> 3 -> ending', () => {
      let state = createInitialGameState();
      state.profile = completeProfile;
      state.screen = 'scene';
      state.currentDecisionId = 1;

      state = advanceToNextStep(state);
      expect(state.currentDecisionId).toBe(2);
      expect(state.screen).toBe('scene');
      expect(state.isChoiceLocked).toBe(false);

      state = advanceToNextStep(state);
      expect(state.currentDecisionId).toBe(3);
      expect(state.screen).toBe('scene');

      state = advanceToNextStep(state);
      expect(state.screen).toBe('ending');
    });
  });

  describe('Story Context and Outcomes', () => {
    it('Decision 1 outcome explains queue for A and overload for B', () => {
      const outcomeA = DECISIONS[1].getOutcome('A', {}, 'architecture');
      expect(outcomeA.whatHappened).toContain('kontrollü');
      expect(outcomeA.whyHappened).toContain('kalıcı kuyruk');
      expect(outcomeA.whyHappened).toContain('Mimari açıdan');

      const outcomeB = DECISIONS[1].getOutcome('B', {}, 'architecture');
      expect(outcomeB.whatHappened).toContain('Aşırı yük');
      expect(outcomeB.whyHappened).toContain('kapasitesini aştı');
    });

    it('Decision 2 outcome respects Decision 1 choice', () => {
      // D1 was A, D2 is A: checks pass, timeout applied
      const outcomeWithD1A = DECISIONS[2].getOutcome('A', { 1: 'A' }, 'testing');
      expect(outcomeWithD1A.whatHappened).toContain('başarıyla geçti');
      expect(outcomeWithD1A.whyHappened).toContain('stabil gecikmeyi doğruladı');
      expect(outcomeWithD1A.whyHappened).toContain('Test mühendisliği açısından');

      // D1 was B, D2 is A: overload test fails, capacity issue reported
      const outcomeWithD1B = DECISIONS[2].getOutcome('A', { 1: 'B' }, 'testing');
      expect(outcomeWithD1B.whatHappened).toContain('başarısız oldu');
      expect(outcomeWithD1B.whatHappened).toContain('kapasite sorunu');

      // D2 is B: checks skipped
      const outcomeD2B = DECISIONS[2].getOutcome('B', { 1: 'A' }, 'testing');
      expect(outcomeD2B.whatHappened).toContain('doğrulanmadan');
    });

    it('Decision 3 outcome handles personal data vs technical summary', () => {
      const outcomeA = DECISIONS[3].getOutcome('A', {}, 'security');
      expect(outcomeA.whatHappened).toContain('Kişisel veriler temizlenerek');
      expect(outcomeA.whyHappened).toContain('Veri güvenliği açısından');

      const outcomeB = DECISIONS[3].getOutcome('B', {}, 'security');
      expect(outcomeB.whatHappened).toContain('Kurgusal hasta adı ve kimlik');
      expect(outcomeB.whyHappened).toContain('veri minimizasyonu');
    });
  });

  describe('Socratic AI Tutor Prompt and Context Isolation', () => {
    it('system instruction explicitly prohibits revealing answer keys or choices', () => {
      expect(SYSTEM_INSTRUCTION).toContain('ASLA');
      expect(SYSTEM_INSTRUCTION).toContain('cevabı söyle');
      expect(SYSTEM_INSTRUCTION).toContain('Sokratik');
    });

    it('scene context for tutor only includes the active decision and never future decisions', () => {
      const context1 = getSceneContextForTutor(1, completeProfile);
      expect(context1).toContain('Karar 1');
      expect(context1).not.toContain('Karar 2');
      expect(context1).not.toContain('Karar 3');
      expect(context1).not.toContain('seçenek A');

      const context2 = getSceneContextForTutor(2, completeProfile);
      expect(context2).toContain('Karar 2');
      expect(context2).not.toContain('Karar 3');
    });
  });

  describe('Reset functionality', () => {
    it('cleanly resets game state to initial blank profile and decisions', () => {
      const state = createInitialGameState();
      state.profile = completeProfile;
      state.choices = { 1: 'A', 2: 'A', 3: 'A' };
      state.screen = 'ending';

      const resetState = createInitialGameState();
      expect(resetState.screen).toBe('profile');
      expect(resetState.profile.level).toBeNull();
      expect(resetState.profile.role).toBeNull();
      expect(resetState.profile.goal).toBeNull();
      expect(resetState.choices).toEqual({});
      expect(resetState.currentDecisionId).toBe(1);
      expect(resetState.isChoiceLocked).toBe(false);
    });
  });
});
