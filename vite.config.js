import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        dropin:      resolve(__dirname, 'src/pages/dropin/index.html'),
        stock:       resolve(__dirname, 'src/pages/stock/index.html'),
        movimientos: resolve(__dirname, 'src/pages/movimientos/index.html'),
        ventas:      resolve(__dirname, 'src/pages/ventas/index.html'),
      },
    },
  },
});
