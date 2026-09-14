import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

const root = fileURLToPath(new URL('.', import.meta.url));

/**
 * Copy the generated token stylesheet into dist so consumers can load the CSS
 * custom properties independently of the component styles:
 *   import 'ds-base/tokens.css';  // the variables + five [data-*] dials
 *   import 'ds-base/styles';      // the component CSS Modules bundle
 */
function copyTokens() {
  return {
    name: 'ds-copy-tokens',
    closeBundle() {
      copyFileSync(
        resolve(root, 'src/styles/tokens.css'),
        resolve(root, 'dist/tokens.css'),
      );
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true, include: ['src'] }),
    copyTokens(),
  ],
  css: {
    modules: {
      // Readable, collision-resistant scoped names in the shipped CSS.
      generateScopedName: 'ds-[name]-[local]',
    },
  },
  build: {
    // One stylesheet for every component CSS Module, emitted as dist/style.css.
    cssCodeSplit: false,
    lib: {
      entry: resolve(root, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Peers — never bundle React into the library.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
