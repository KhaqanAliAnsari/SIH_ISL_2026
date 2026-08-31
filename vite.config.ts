import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Target modern Chromium (Android WebView 10+) — eliminates transpilation polyfills
      target: 'esnext',
      // esbuild minifier: ~3x faster than terser, near-identical output
      minify: 'esbuild',
      // Raise warning threshold — MediaPipe chunks are intentionally large
      chunkSizeWarningLimit: 8000,
      rollupOptions: {
        output: {
          // Split heavy deps into separately-cacheable chunks
          manualChunks: (id: string) => {
            if (id.includes('@mediapipe') || id.includes('tasks-vision')) {
              return 'mediapipe';
            }
            if (id.includes('motion') || id.includes('framer')) {
              return 'motion';
            }
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase';
            }
            if (id.includes('@google/genai')) {
              return 'genai';
            }
            if (id.includes('lucide')) {
              return 'icons';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    worker: {
      // Bundle web workers as ES modules for better tree-shaking
      format: 'es',
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Cross-Origin Isolation: enables SharedArrayBuffer for WASM SIMD threads
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: [
          '**/graphify-out/**',
          '**/.git/**',
          '**/isl_dtw/**',
          '**/*.zip',
          '**/*.db',
          '**/.agents/**',
          '**/node_modules/**',
        ],
      },
    },
  };
});
