/**
 * 合成ルート（composition root）。
 * 各レイヤー（core / domain / render / ui）をここで配線する。
 * Phase 1: WebGL2 ping-pong による Gray-Scott 反応拡散を rAF ループで表示する。
 */
import './style.css';
import { GpuContext } from './core/GpuContext';
import { Simulator } from './core/Simulator';
import { DisplayShader } from './render/DisplayShader';
import {
  genesisStateAt,
  paramsForGenesis,
  type GenesisOptions,
  type GenesisState,
} from './domain/genesis';

const SIZE = 512; // シミュレーション解像度（正方グリッド）
const STEPS_PER_FRAME = 8; // 1 フレームあたりの計算ステップ数（成長の速さ）
const GENESIS_DURATION_MS = 45000; // 成因の進行 t（0..1）に対応させる実時間（45秒で冷え切る）
// 冷却カーブの設定。coolingRate を強めにして、t=1 で十分過冷却（≒成長）まで到達させる。
const GENESIS_OPTS: GenesisOptions = { coolingRate: 3, threshold: 0.6 };

/** 成因の現在状態を日本語パネル文字列に整形する（表示専用の純関数）。 */
function formatGenesis(t: number, s: GenesisState): string {
  const phase = !s.supersaturated
    ? '高温・未過飽和（静穏：模様はまだ出ない）'
    : s.progress < 0.5
      ? '過飽和・核生成（結晶の芽が現れる）'
      : '過冷却・結晶成長（サンゴ状に育つ）';
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  return [
    `Phase 2: 成因ドライバ稼働中 — ${phase}`,
    `経過 ${pct(t)} / 温度 ${s.temperature.toFixed(2)} / 過飽和の進み ${pct(s.progress)}`,
  ].join('\n');
}

const canvas = document.querySelector<HTMLCanvasElement>('#sim-canvas');
if (!canvas) {
  throw new Error('sim-canvas が見つからない');
}
const panel = document.querySelector<HTMLElement>('#panel .placeholder');

try {
  const ctx = new GpuContext(canvas);
  const sim = new Simulator(ctx, SIZE, SIZE);
  const display = new DisplayShader(ctx);

  const startMs = performance.now();

  const loop = (nowMs: number) => {
    // 経過時間を成因の進行 t（0..1）へ写像。45 秒で冷え切り、以降は t=1 に張り付く。
    const t = Math.min((nowMs - startMs) / GENESIS_DURATION_MS, 1);
    const state = genesisStateAt(t, GENESIS_OPTS);
    sim.setParams(paramsForGenesis(t, GENESIS_OPTS));

    sim.step(STEPS_PER_FRAME);
    display.render(sim.stateTexture, canvas.width, canvas.height);

    if (panel) {
      panel.textContent = formatGenesis(t, state);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  if (panel) {
    panel.textContent = `初期化に失敗: ${message}`;
  }
  throw err;
}
