import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: { entry: resolve(__dirname, 'src/main.ts'), formats: ['es'] },
    //target: 'node20',
    rollupOptions: {
      external: [...builtinModules, /^node:/],
    },
  },
  resolve: { alias: { src: resolve('src/') } },
});
