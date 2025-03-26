import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensure assets are loaded relative to index.html
  server: {
    port: 5173,
    proxy: {
      '/query': {
        target: 'http://localhost:8080',
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
    __DEBUG__: 'true',
    __LOG_LEVEL__: JSON.stringify('error'),
    __ENV__: JSON.stringify('development'),
    __API_URL__: JSON.stringify('http://localhost:8080'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@apollo/client', '@mui/material'],
  },
});
