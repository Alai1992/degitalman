import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5001,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  optimizeDeps: {
    exclude: ['coze-coding-dev-sdk'],
  },
  appType: 'spa',
  build: {
    outDir: 'dist',
  },
});
