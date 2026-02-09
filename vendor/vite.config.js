import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '../../assets': path.resolve(__dirname, '../assets'),
    }
  },
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

