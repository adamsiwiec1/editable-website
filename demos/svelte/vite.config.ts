import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'spa',
  plugins: [svelte()],
  server: {
    port: 4013,
    strictPort: true,
    fs: { allow: [resolve(__dirname, '..')] },
  },
});
