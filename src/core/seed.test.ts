import { describe, it, expect } from 'vitest';
import { createSeed } from './seed';

describe('createSeed', () => {
  it('RGBA 並びで width*height*4 の長さ', () => {
    const d = createSeed(8, 8);
    expect(d.length).toBe(8 * 8 * 4);
  });

  it('外側は U=1, V=0（核の外は基質で満たす）', () => {
    const d = createSeed(16, 16);
    // 左上端 (0,0)
    expect(d[0]).toBe(1.0); // U
    expect(d[1]).toBe(0.0); // V
  });

  it('中央には V が注入されている（核がある）', () => {
    const w = 16;
    const h = 16;
    const d = createSeed(w, h, 0.5);
    const ci = ((h / 2) * w + w / 2) * 4;
    expect(d[ci + 1]).toBeGreaterThan(0); // 中央の V > 0
  });
});
