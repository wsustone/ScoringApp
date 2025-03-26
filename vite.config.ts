import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = new URL(env.VITE_API_URL || 'http://localhost:8080');

  return {
    plugins: [react()],
    base: './', // Ensure assets are loaded relative to index.html
    server: {
      port: 5173,
      proxy: {
        '/query': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      manifest: true,
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
  };
});
