/**
 * ping-pong バッファ。
 * GPU は「同じテクスチャを読みながら書く」ことができないので、
 * 読み込み用(read)と書き込み用(write)の float テクスチャを2枚持ち、
 * 1ステップごとに swap() で役割を入れ替える。
 *
 * フォーマットは RGBA32F。本シミュレーションは R=U, G=V の2成分だけ使うが、
 * 多くの GPU で RGBA が最も無難に描画先(color-renderable)になるため RGBA を選ぶ。
 */
export class PingPongFBO {
  readonly width: number;
  readonly height: number;
  private readonly gl: WebGL2RenderingContext;
  private texA: WebGLTexture;
  private texB: WebGLTexture;
  private fboA: WebGLFramebuffer;
  private fboB: WebGLFramebuffer;

  /**
   * @param initial 初期状態（length = width*height*4, RGBA 並び）。省略時はゼロ。
   */
  constructor(
    gl: WebGL2RenderingContext,
    width: number,
    height: number,
    initial?: Float32Array,
  ) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.texA = createFloatTexture(gl, width, height, initial);
    this.texB = createFloatTexture(gl, width, height, initial);
    this.fboA = attachToFbo(gl, this.texA);
    this.fboB = attachToFbo(gl, this.texB);
  }

  /** 現在の読み込み元テクスチャ。 */
  get readTexture(): WebGLTexture {
    return this.texA;
  }

  /** 書き込み先 FBO をバインドし、ビューポートを合わせる。 */
  bindWrite(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboB);
    gl.viewport(0, 0, this.width, this.height);
  }

  /** read と write の役割を入れ替える。 */
  swap(): void {
    [this.texA, this.texB] = [this.texB, this.texA];
    [this.fboA, this.fboB] = [this.fboB, this.fboA];
  }
}

function createFloatTexture(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  initial?: Float32Array,
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) {
    throw new Error('テクスチャの生成に失敗');
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA32F, // 内部フォーマット（32bit float ×4）
    width,
    height,
    0,
    gl.RGBA,
    gl.FLOAT,
    initial ?? null,
  );
  // float テクスチャは線形補間が保証されないので NEAREST。
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  // 端をトーラス状に繋ぐ（反応拡散パターンが端で途切れない）。
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

function attachToFbo(gl: WebGL2RenderingContext, tex: WebGLTexture): WebGLFramebuffer {
  const fbo = gl.createFramebuffer();
  if (!fbo) {
    throw new Error('FBO の生成に失敗');
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error('FBO が不完全（float への描画に未対応の可能性）');
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return fbo;
}
