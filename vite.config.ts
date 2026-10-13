import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 정적 사이트: 서버 런타임 없음. `vite build` 결과(dist/)를 그대로 Vercel에 올리면 된다.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    // 라이브러리를 따로 묶어 재방문 시 캐시가 유지되도록 (앱 코드·데이터만 바뀜)
    rollupOptions: { output: { manualChunks: { radix: ['radix-ui'], motion: ['motion'] } } },
  },
});
