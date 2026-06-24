#version 300 es
precision highp float;
// Gray-Scott 反応拡散の1ステップ。
// 状態は R=U（基質）, G=V（生成物）。隣接セルとの拡散 + 反応 U + 2V -> 3V を解く。
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uState;
uniform vec2 uTexel; // (1/width, 1/height)
uniform float uFeed; // 供給率 F
uniform float uKill; // 除去率 k
uniform float uDa;   // U の拡散係数
uniform float uDb;   // V の拡散係数
uniform float uDt;   // 時間刻み

// 3x3 重み付きラプラシアン（離散拡散）。
vec2 laplacian() {
  vec2 s = vec2(0.0);
  s += texture(uState, vUv + uTexel * vec2(-1.0,  0.0)).rg * 0.2;
  s += texture(uState, vUv + uTexel * vec2( 1.0,  0.0)).rg * 0.2;
  s += texture(uState, vUv + uTexel * vec2( 0.0, -1.0)).rg * 0.2;
  s += texture(uState, vUv + uTexel * vec2( 0.0,  1.0)).rg * 0.2;
  s += texture(uState, vUv + uTexel * vec2(-1.0, -1.0)).rg * 0.05;
  s += texture(uState, vUv + uTexel * vec2( 1.0, -1.0)).rg * 0.05;
  s += texture(uState, vUv + uTexel * vec2(-1.0,  1.0)).rg * 0.05;
  s += texture(uState, vUv + uTexel * vec2( 1.0,  1.0)).rg * 0.05;
  s += texture(uState, vUv).rg * -1.0;
  return s;
}

void main() {
  vec2 c = texture(uState, vUv).rg;
  float a = c.r;
  float b = c.g;
  vec2 lap = laplacian();
  float reaction = a * b * b;
  float da = uDa * lap.r - reaction + uFeed * (1.0 - a);
  float db = uDb * lap.g + reaction - (uKill + uFeed) * b;
  float na = clamp(a + da * uDt, 0.0, 1.0);
  float nb = clamp(b + db * uDt, 0.0, 1.0);
  outColor = vec4(na, nb, 0.0, 1.0);
}
