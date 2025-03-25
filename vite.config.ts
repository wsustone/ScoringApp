import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Loads .env, .env.local, and .env.[mode] files
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  const isPreview = mode === 'preview';

  // Default to local API in development, use environment variable in production
  const apiUrl = isProduction 
    ? env.VITE_API_URL 
    : 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    define: {
      __DEBUG__: env.VITE_DEBUG === 'true',
      __LOG_LEVEL__: JSON.stringify(env.VITE_LOG_LEVEL || 'error'),
      __ENV__: JSON.stringify(env.VITE_ENV || mode),
      __API_URL__: JSON.stringify(apiUrl),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      manifest: true,
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', '@apollo/client', '@mui/material'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@apollo/client', '@mui/material'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
});
