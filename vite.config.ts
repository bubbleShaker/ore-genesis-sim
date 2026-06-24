import { defineConfig } from 'vite';

// GitHub Pages のプロジェクトページはサブパス配信なので base を合わせる。
// （https://bubbleshaker.github.io/ore-genesis-sim/ 配下にアセットを置く）
export default defineConfig({
  base: '/ore-genesis-sim/',
});
