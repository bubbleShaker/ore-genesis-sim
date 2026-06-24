/**
 * WebGL2 コンテキストの初期化と、全画面描画のための最小ヘルパ。
 *
 * - float テクスチャへ「描き込む」には拡張 EXT_color_buffer_float が要る。
 *   これが無いと反応拡散の状態（連続値）を保持できないので必須扱いにする。
 * - 全画面の塗りつぶしは、頂点バッファを使わず gl_VertexID から三角形を
 *   生成する方式（fullscreen triangle）。バッファ管理が消えてコードが減る。
 */
export class GpuContext {
  readonly gl: WebGL2RenderingContext;
  /** 属性を使わない描画でも VAO のバインドが要るため、空 VAO を1つ持つ。 */
  private readonly emptyVao: WebGLVertexArrayObject;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 が利用できない環境');
    }
    if (!gl.getExtension('EXT_color_buffer_float')) {
      throw new Error('EXT_color_buffer_float 非対応（float テクスチャへ描画できない）');
    }
    this.gl = gl;
    const vao = gl.createVertexArray();
    if (!vao) {
      throw new Error('VAO の生成に失敗');
    }
    this.emptyVao = vao;
  }

  /** 全画面三角形を1回描く。描画先のバインド/ビューポート設定は呼び出し側の責務。 */
  drawFullscreen(): void {
    const gl = this.gl;
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
}
