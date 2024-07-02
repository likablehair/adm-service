import { defineConfig } from 'vite';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  build: { 
    lib: { entry: resolve(__dirname, 'src/main.ts'), formats: ['es'] },
    rollupOptions: { 
      external: [
        'node:fs/promises'
      ] 
    },
  },
  resolve: { alias: { src: resolve('src/') } },
  plugins: [
    nodePolyfills()
  ],
});
