#version 300 es
// 頂点バッファ無しで全画面を覆う三角形を生成する。
// gl_VertexID = 0,1,2 から clip 座標 (-1,-1)(3,-1)(-1,3) を作り、
// 可視領域 [-1,1]^2 に対応する UV [0,1]^2 を渡す。
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); // (0,0)(2,0)(0,2)
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
