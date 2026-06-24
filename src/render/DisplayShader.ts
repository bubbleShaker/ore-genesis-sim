import { GpuContext } from '../core/GpuContext';
import { ShaderProgram } from '../core/ShaderProgram';
import fullscreenVert from '../core/shaders/fullscreen.vert?raw';
import displayFrag from './display.frag?raw';

/**
 * 状態テクスチャを画面（デフォルトフレームバッファ）に着色描画する。
 * シミュレーション計算とは責務を分け、可視化だけを担当する。
 */
export class DisplayShader {
  private readonly ctx: GpuContext;
  private readonly program: ShaderProgram;

  constructor(ctx: GpuContext) {
    this.ctx = ctx;
    this.program = new ShaderProgram(ctx.gl, fullscreenVert, displayFrag);
  }

  render(stateTexture: WebGLTexture, viewWidth: number, viewHeight: number): void {
    const { gl } = this.ctx;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, viewWidth, viewHeight);
    this.program.use();
    this.program.setTexture('uState', stateTexture, 0);
    this.ctx.drawFullscreen();
  }
}
