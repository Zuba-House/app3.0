import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper routing for SPA
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Base path for deployment (empty for root)
  base: '/'
})
