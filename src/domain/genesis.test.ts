import { describe, it, expect } from 'vitest';
import {
  coolingTemperature,
  isSupersaturated,
  genesisStateAt,
  paramsForGenesis,
  QUIESCENT,
  GROWTH,
} from './genesis';

describe('coolingTemperature', () => {
  it('t=0 で最高温（1.0）', () => {
    expect(coolingTemperature(0)).toBeCloseTo(1);
  });

  it('時間とともに単調に下がる', () => {
    expect(coolingTemperature(0.5)).toBeGreaterThan(coolingTemperature(1));
  });

  it('範囲外の t はクランプされる', () => {
    expect(coolingTemperature(-1)).toBeCloseTo(1);
    expect(coolingTemperature(2)).toBeCloseTo(coolingTemperature(1));
  });
});

describe('isSupersaturated', () => {
  it('しきい値を下回ると過飽和（析出開始）', () => {
    expect(isSupersaturated(0.3, 0.5)).toBe(true);
    expect(isSupersaturated(0.7, 0.5)).toBe(false);
  });
});

describe('genesisStateAt', () => {
  it('t=0 は高温・未過飽和・progress=0', () => {
    const s = genesisStateAt(0, { threshold: 0.6 });
    expect(s.temperature).toBeCloseTo(1);
    expect(s.supersaturated).toBe(false);
    expect(s.progress).toBe(0);
  });

  it('時間が進むと過飽和になり progress が増える', () => {
    const early = genesisStateAt(0.2);
    const late = genesisStateAt(0.9);
    expect(late.temperature).toBeLessThan(early.temperature);
    expect(late.progress).toBeGreaterThan(early.progress);
    expect(late.supersaturated).toBe(true);
  });

  it('progress は 0..1 に収まる', () => {
    for (const t of [-1, 0, 0.5, 1, 2]) {
      const { progress } = genesisStateAt(t, { coolingRate: 5 });
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });
});

describe('paramsForGenesis', () => {
  it('未過飽和（t=0）では静穏パラメータに一致', () => {
    expect(paramsForGenesis(0, { threshold: 0.6 })).toEqual(QUIESCENT);
  });

  // 指数冷却なので progress は 1.0 に漸近するだけ＝GROWTH へ「近づく」のが正しい挙動。
  it('十分冷えると成長パラメータ（GROWTH）へ近づく', () => {
    const p = paramsForGenesis(1, { coolingRate: 5 });
    expect(p.kill).toBeCloseTo(GROWTH.kill); // kill は元から一定
    expect(p.dt).toBeGreaterThan(0.9); // dt はほぼ全速まで上がる
    expect(p.dt).toBeLessThanOrEqual(GROWTH.dt);
  });

  // 真っ黒バグの再発防止: 冷却レバーは dt なので、全工程で kill は GROWTH の
  // 「育つ域」に固定され、種(V) が致死域に入ることが無いことを保証する。
  it('全 t で kill が致死域に入らない（GROWTH.kill で一定）', () => {
    for (const t of [0, 0.1, 0.3, 0.5, 0.7, 1]) {
      expect(paramsForGenesis(t, { coolingRate: 3 }).kill).toBeCloseTo(GROWTH.kill);
    }
  });

  it('dt は冷却が進むほど単調に増える（反応が速くなる）', () => {
    const dtAt = (t: number) => paramsForGenesis(t, { coolingRate: 3 }).dt;
    expect(dtAt(0)).toBeCloseTo(QUIESCENT.dt);
    expect(dtAt(0.5)).toBeGreaterThan(dtAt(0));
    expect(dtAt(1)).toBeGreaterThan(dtAt(0.5));
    expect(dtAt(1)).toBeGreaterThan(0.9); // GROWTH.dt(=1.0) に漸近
  });
});
