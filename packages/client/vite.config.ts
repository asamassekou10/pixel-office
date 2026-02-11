import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Let Vite resolve the workspace package source directly
      '@pixel-office/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'ES2022',
    assetsInlineLimit: 0,
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
});
