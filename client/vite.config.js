import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages. The repo is `SolenSarkar/Basic-React-App`,
  // so the site is served from https://SolenSarkar.github.io/Basic-React-App/
  base: '/Basic-React-App/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

