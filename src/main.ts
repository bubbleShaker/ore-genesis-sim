/**
 * 合成ルート（composition root）。
 * 各レイヤー（core / domain / render / ui）をここで配線する。
 * Phase 0 では canvas の取得と WebGL2 利用可否の確認のみ。実体は Phase 1 以降で追加する。
 */
import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#sim-canvas');
if (!canvas) {
  throw new Error('sim-canvas が見つからない');
}

// WebGL2 が使えるかだけ先に確認しておく（Phase 1 の前提）。
const gl = canvas.getContext('webgl2');
const panel = document.querySelector<HTMLElement>('#panel .placeholder');
if (panel) {
  panel.textContent = gl
    ? 'Phase 0 OK: WebGL2 が利用可能。Phase 1 でシミュレーションを実装する。'
    : 'WebGL2 が利用できない環境。Phase 1 以降の動作には WebGL2 が必要。';
}
