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

  it('十分冷えると成長パラメータへ近づく（kill が QUIESCENT より下がる）', () => {
    const p = paramsForGenesis(1, { coolingRate: 5 });
    expect(p.kill).toBeLessThan(QUIESCENT.kill);
    expect(p.kill).toBeGreaterThanOrEqual(GROWTH.kill);
  });
});
