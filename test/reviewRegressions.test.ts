import { describe, expect, it } from 'vitest';
import { evaluateEnding } from '../src/game/engine';
import { getSceneContextForTutor } from '../server/geminiTutorPrompt';
import type { UserProfile } from '../src/types';

describe('Review regressions', () => {
  it.each([
    ['AAA', true], ['AAB', true], ['ABA', true], ['ABB', true],
    ['BAA', false], ['BAB', false], ['BBA', false], ['BBB', false],
  ] as const)('%s reports capacity independently from the overall ending', (path, stable) => {
    const choices = { 1: path[0], 2: path[1], 3: path[2] } as Parameters<typeof evaluateEnding>[0];
    expect(evaluateEnding(choices).isSystemStable).toBe(stable);
  });

  it('uses the learning goal without adding future scenes or an answer key', () => {
    const profile: UserProfile = { level: 'beginner', role: 'developer', goal: 'architecture' };
    const architecture = getSceneContextForTutor(1, profile);
    const security = getSceneContextForTutor(1, { ...profile, goal: 'security' });
    expect(architecture).not.toBe(security);
    expect(architecture).toContain('Mimari');
    expect(security).toContain('Veri güvenliği');
    expect(security).not.toContain('Karar 2');
    expect(security).not.toContain('A-A-A');
  });
});
