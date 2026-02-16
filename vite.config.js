import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/chat': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api/identity': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/api/presence': {
        target: 'http://localhost:8003',
        changeOrigin: true,
      },
      '/api/ai': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
      '/api/quantum': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
