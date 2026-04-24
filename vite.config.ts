import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const portFromEnv = Number.parseInt(process.env.PORT ?? '', 10);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number.isFinite(portFromEnv) ? portFromEnv : 5173,
    strictPort: Number.isFinite(portFromEnv),
  },
});
