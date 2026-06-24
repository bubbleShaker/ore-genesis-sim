import { GpuContext } from './GpuContext';
import { PingPongFBO } from './PingPongFBO';
import { ShaderProgram } from './ShaderProgram';
import { createSeed } from './seed';
import fullscreenVert from './shaders/fullscreen.vert?raw';
import grayscottFrag from './shaders/grayscott.frag?raw';

/** Gray-Scott のパラメータ。プリセットで模様が大きく変わる。 */
export interface GrayScottParams {
  feed: number;
  kill: number;
  dA: number;
  dB: number;
  dt: number;
}

/** 「coral（サンゴ状）」プリセット。Phase 1 の動作確認用。 */
export const CORAL: GrayScottParams = {
  feed: 0.0545,
  kill: 0.062,
  dA: 1.0,
  dB: 0.5,
  dt: 1.0,
};

/**
 * 反応拡散シミュレーションを1ステップずつ進める。
 * ping-pong バッファに対し更新シェーダを描画 → swap、を繰り返す。
 * `.frag/.vert` は Vite の `?raw` で文字列として import している
 * （別途プラグイン不要でシェーダソースを取り込める）。
 */
export class Simulator {
  private readonly ctx: GpuContext;
  private readonly program: ShaderProgram;
  private readonly buffer: PingPongFBO;
  private readonly params: GrayScottParams;
  readonly width: number;
  readonly height: number;

  constructor(
    ctx: GpuContext,
    width: number,
    height: number,
    params: GrayScottParams = CORAL,
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.params = params;
    this.program = new ShaderProgram(ctx.gl, fullscreenVert, grayscottFrag);
    this.buffer = new PingPongFBO(ctx.gl, width, height, createSeed(width, height));
  }

  /** N ステップ進める（1 フレームで複数ステップ回すと成長が速く見える）。 */
  step(times = 1): void {
    const { gl } = this.ctx;
    const p = this.program;
    for (let n = 0; n < times; n++) {
      this.buffer.bindWrite();
      p.use();
      p.setTexture('uState', this.buffer.readTexture, 0);
      p.setVec2('uTexel', 1 / this.width, 1 / this.height);
      p.setFloat('uFeed', this.params.feed);
      p.setFloat('uKill', this.params.kill);
      p.setFloat('uDa', this.params.dA);
      p.setFloat('uDb', this.params.dB);
      p.setFloat('uDt', this.params.dt);
      this.ctx.drawFullscreen();
      this.buffer.swap();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** 現在の状態テクスチャ（表示側が読む）。 */
  get stateTexture(): WebGLTexture {
    return this.buffer.readTexture;
  }
}
