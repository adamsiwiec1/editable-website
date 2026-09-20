import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  server: {
    port: 4011,
    strictPort: true,
    fs: { allow: [resolve(__dirname, '..')] },
  },
});
