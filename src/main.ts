/**
 * 合成ルート（composition root）。
 * 各レイヤー（core / domain / render / ui）をここで配線する。
 * Phase 1: WebGL2 ping-pong による Gray-Scott 反応拡散を rAF ループで表示する。
 */
import './style.css';
import { GpuContext } from './core/GpuContext';
import { Simulator } from './core/Simulator';
import { DisplayShader } from './render/DisplayShader';

const SIZE = 512; // シミュレーション解像度（正方グリッド）
const STEPS_PER_FRAME = 8; // 1 フレームあたりの計算ステップ数（成長の速さ）

const canvas = document.querySelector<HTMLCanvasElement>('#sim-canvas');
if (!canvas) {
  throw new Error('sim-canvas が見つからない');
}
const panel = document.querySelector<HTMLElement>('#panel .placeholder');

try {
  const ctx = new GpuContext(canvas);
  const sim = new Simulator(ctx, SIZE, SIZE);
  const display = new DisplayShader(ctx);

  if (panel) {
    panel.textContent =
      'Phase 1: Gray-Scott 反応拡散が動作中。過飽和からの「核」が拡散・反応してパターンを作る様子。';
  }

  const loop = () => {
    sim.step(STEPS_PER_FRAME);
    display.render(sim.stateTexture, canvas.width, canvas.height);
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
