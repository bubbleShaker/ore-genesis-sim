/**
 * 成因シナリオの最小ロジック。
 * 「鉱石が生まれるまで」を、時間とともに変化する温度／過飽和度で表す。
 * Phase 4 でここを CA のドライバとして使う。Phase 0 ではテスト対象の純粋関数のみ置く。
 */

/** 時刻 t（0..1）における正規化温度。冷却を表す単調減少カーブ。 */
export function coolingTemperature(t: number, coolingRate = 1): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  // 指数的に冷えていく近似。coolingRate が大きいほど急冷。
  return Math.exp(-coolingRate * clamped);
}

/** 過飽和か否か。温度がしきい値を下回ると析出（結晶化）が始まる。 */
export function isSupersaturated(temperature: number, threshold: number): boolean {
  return temperature < threshold;
}
