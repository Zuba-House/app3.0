import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://zuba-api.onrender.com',
        changeOrigin: true
      }
    }
  }
})

