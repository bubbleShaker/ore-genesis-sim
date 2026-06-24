/**
 * 反応拡散の初期状態を作る純粋関数。
 * 全面を U=1, V=0 にし、中央の正方形領域に V を注入して「核」を置く。
 * GPU 非依存なので単体テストできる（RGBA 並びの Float32Array を返す）。
 */
export function createSeed(width: number, height: number, blobRatio = 0.1): Float32Array {
  const data = new Float32Array(width * height * 4);
  const halfW = Math.floor((width * blobRatio) / 2);
  const halfH = Math.floor((height * blobRatio) / 2);
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const inBlob = Math.abs(x - cx) < halfW && Math.abs(y - cy) < halfH;
      data[i] = inBlob ? 0.5 : 1.0; // R = U
      data[i + 1] = inBlob ? 0.25 : 0.0; // G = V
      data[i + 2] = 0.0;
      data[i + 3] = 1.0;
    }
  }
  return data;
}
