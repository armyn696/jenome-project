import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/flashcard/',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5175
  },
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  },
  optimizeDeps: {
    include: ['lucide-react']
  },
});
