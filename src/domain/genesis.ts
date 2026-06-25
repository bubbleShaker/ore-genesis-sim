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

/**
 * Gray-Scott のパラメータ。プリセットで模様が大きく変わる。
 * 物理基盤（domain）の型なので、ここに置く。core/render はこれを参照する
 * （依存の向きを domain ← infrastructure に保つ＝クリーンアーキ）。
 */
export interface GrayScottParams {
  feed: number;
  kill: number;
  dA: number;
  dB: number;
  dt: number;
}

/** 十分に過冷却・過飽和した状態。サンゴ状に「核生成→成長」する。 */
export const GROWTH: GrayScottParams = {
  feed: 0.0545,
  kill: 0.062,
  dA: 1.0,
  dB: 0.5,
  dt: 1.0,
};

/**
 * 過飽和に達する前の静穏状態。
 * 冷却のレバーは kill ではなく dt（反応の時間刻み）に持たせる。
 * feed/kill/dA/dB は GROWTH と同じ「育つ領域」のまま dt を小さくし、反応をほぼ止める。
 * → 種(V) が消えないので、後で dt が上がると核生成→成長が必ず再開できる。
 * （kill を上げて静穏にすると V が全面 0 に死に、二度と模様が出ない＝以前の真っ黒バグ）
 */
export const QUIESCENT: GrayScottParams = {
  ...GROWTH,
  dt: 0.15,
};

/** 成因シナリオの設定。冷却の速さと、析出が始まる温度しきい値。 */
export interface GenesisOptions {
  coolingRate?: number;
  threshold?: number;
}

/** 時刻 t における成因の状態。UI 表示にも使う。 */
export interface GenesisState {
  temperature: number;
  supersaturated: boolean;
  /** 過飽和の進み具合 0..1（しきい値直下=0, 絶対零度相当=1）。成長の強さ。 */
  progress: number;
}

/** 時刻 t（0..1）の成因状態を求める。 */
export function genesisStateAt(t: number, options: GenesisOptions = {}): GenesisState {
  const { coolingRate = 1, threshold = 0.6 } = options;
  const temperature = coolingTemperature(t, coolingRate);
  const supersaturated = isSupersaturated(temperature, threshold);
  // しきい値を下回ってからの「冷え込み量」を 0..1 に正規化。
  const progress = threshold > 0 ? clamp01((threshold - temperature) / threshold) : 0;
  return { temperature, supersaturated, progress };
}

/**
 * 成因状態 → Gray-Scott パラメータ。
 * 過飽和の進み具合 progress で QUIESCENT→GROWTH を線形補間する。
 * これにより「冷却が進むほど結晶成長が活発になる」物語を1本の式で表す。
 */
export function paramsForGenesis(t: number, options: GenesisOptions = {}): GrayScottParams {
  const { progress } = genesisStateAt(t, options);
  return {
    feed: lerp(QUIESCENT.feed, GROWTH.feed, progress),
    kill: lerp(QUIESCENT.kill, GROWTH.kill, progress),
    dA: lerp(QUIESCENT.dA, GROWTH.dA, progress),
    dB: lerp(QUIESCENT.dB, GROWTH.dB, progress),
    dt: lerp(QUIESCENT.dt, GROWTH.dt, progress),
  };
}

function clamp01(x: number): number {
  return Math.min(Math.max(x, 0), 1);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
