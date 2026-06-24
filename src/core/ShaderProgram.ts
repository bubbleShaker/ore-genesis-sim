/**
 * WebGL2 のシェーダを「コンパイル → リンク → uniform 設定」まで面倒見るラッパ。
 * uniform location はコンストラクタで都度 getUniformLocation を呼ぶ代わりに
 * 利用時にキャッシュして引く（毎フレーム呼ぶので無駄な GL 呼び出しを避ける）。
 */
export class ShaderProgram {
  readonly program: WebGLProgram;
  private readonly gl: WebGL2RenderingContext;
  private readonly uniformCache = new Map<string, WebGLUniformLocation | null>();

  constructor(gl: WebGL2RenderingContext, vertexSrc: string, fragmentSrc: string) {
    this.gl = gl;
    const vs = compile(gl, gl.VERTEX_SHADER, vertexSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      throw new Error(`シェーダのリンクに失敗: ${log}`);
    }
    // リンク後はシェーダオブジェクト本体は不要。
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    this.program = program;
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  private location(name: string): WebGLUniformLocation | null {
    let loc = this.uniformCache.get(name);
    if (loc === undefined) {
      loc = this.gl.getUniformLocation(this.program, name);
      this.uniformCache.set(name, loc);
    }
    return loc;
  }

  setFloat(name: string, v: number): void {
    this.gl.uniform1f(this.location(name), v);
  }

  setVec2(name: string, x: number, y: number): void {
    this.gl.uniform2f(this.location(name), x, y);
  }

  /** テクスチャを指定ユニットにバインドして sampler uniform に割り当てる。 */
  setTexture(name: string, texture: WebGLTexture, unit: number): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.location(name), unit);
  }
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('シェーダオブジェクトの生成に失敗');
  }
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`シェーダのコンパイルに失敗: ${log}`);
  }
  return shader;
}
