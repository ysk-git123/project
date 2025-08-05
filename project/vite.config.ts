import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/YJL': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/YSK': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/LZY': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
