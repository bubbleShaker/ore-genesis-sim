#version 300 es
precision highp float;
// 状態テクスチャの V 成分を色に変換して画面に出す（Phase 1 は暫定カラーマップ）。
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uState;

void main() {
  float v = texture(uState, vUv).g;
  vec3 dark = vec3(0.04, 0.04, 0.07);
  vec3 bright = vec3(0.40, 0.85, 1.00);
  vec3 col = mix(dark, bright, smoothstep(0.0, 0.5, v));
  outColor = vec4(col, 1.0);
}
