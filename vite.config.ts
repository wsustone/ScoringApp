import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = 'http://localhost:8080'; // Hardcode for local development

  console.log('API URL:', apiUrl); // Debug log

  return {
    plugins: [react()],
    base: './', // Ensure assets are loaded relative to index.html
    server: {
      port: 5173,
      proxy: {
        '/graphql': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/graphql/, '')
        }
      },
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      manifest: true,
    },
  };
});
