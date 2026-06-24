import { describe, it, expect } from 'vitest';
import { coolingTemperature, isSupersaturated } from './genesis';

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
