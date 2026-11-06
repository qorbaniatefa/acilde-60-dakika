import policy from '../../model-policy.json';
import type { DecisionChoices, UserLevel } from '../types';

export const FEATURE_NAMES = policy.features.map(f => f.name);
export type FeatureVector = [number, number, number, number, number, number];
export interface DecisionRecord {
  oturum_id: string;
  kaynak: 'gercek';
  bekleme_sn: number;
  duzenleme_sayisi: number;
  onceki_yanlis: number;
  onceki_ipucu: number;
  sahne_no: number;
  deneyim: number;
  destek_istegi: 0 | 1;
}

export function buildFeatures(wait: number, edits: number, choices: DecisionChoices, hints: number,
  scene: number, level: UserLevel | null): FeatureVector {
  const mistakes = Object.entries(choices).filter(([id, choice]) => Number(id) < scene && choice === 'B').length;
  return [wait, edits, mistakes, hints, scene, level === 'experienced' ? 1 : 0]
    .map((n, i) => Math.min(policy.features[i].maximum, Math.max(policy.features[i].minimum, n))) as FeatureVector;
}

export function recordDecision(consent: boolean, session: string, features: FeatureVector, label: 0 | 1): DecisionRecord | null {
  if (!consent) return null;
  return {oturum_id: session, kaynak: 'gercek', bekleme_sn: features[0], duzenleme_sayisi: features[1],
    onceki_yanlis: features[2], onceki_ipucu: features[3], sahne_no: features[4], deneyim: features[5], destek_istegi: label};
}

export function csvExport(rows: DecisionRecord[]): string {
  const columns: (keyof DecisionRecord)[] = ['oturum_id', 'kaynak', 'bekleme_sn', 'duzenleme_sayisi',
    'onceki_yanlis', 'onceki_ipucu', 'sahne_no', 'deneyim', 'destek_istegi'];
  const escape = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  return columns.join(',') + '\n' + rows.map(row => columns.map(key =>
    typeof row[key] === 'number' || /^[\w-]+$/.test(String(row[key])) ? row[key] : escape(row[key])).join(',')).join('\n') + '\n';
}
