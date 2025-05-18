import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8111',
        changeOrigin: true,
        // Optionally, you can rewrite the path if needed:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
