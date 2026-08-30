import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': import.meta.dirname,
      },
    },
    server: {
      // AI Studio에서 DISABLE_HMR=true를 주입한 경우 파일 감시를 끕니다.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
