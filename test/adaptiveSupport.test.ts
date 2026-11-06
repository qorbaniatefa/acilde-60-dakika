import { describe, expect, it } from 'vitest';
import { buildFeatures, csvExport, recordDecision } from '../src/ml/behavior';

describe('privacy and model behavior', () => {
  it('uses only past mistakes and clamps measurements in policy order', () => {
    expect(buildFeatures(200, 70, {1: 'B', 2: 'B'}, 9, 2, 'experienced'))
      .toEqual([180, 60, 1, 6, 2, 1]);
  });
  it('never creates a record without consent', () => {
    expect(recordDecision(false, 'uuid', [5, 0, 0, 0, 1, 1], 1)).toBeNull();
  });
  it('exports only fixed numeric columns and random session identity', () => {
    const row = recordDecision(true, 'a-random-uuid', [5, 0, 0, 0, 1, 1], 1)!;
    const csv = csvExport([row]);
    expect(csv).toContain('oturum_id,kaynak,bekleme_sn,duzenleme_sayisi,onceki_yanlis,onceki_ipucu,sahne_no,deneyim,destek_istegi');
    expect(csv).toContain('a-random-uuid,gercek,5,0,0,0,1,1,1');
    expect(Object.keys(row)).toHaveLength(9);
  });
});
