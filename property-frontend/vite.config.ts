// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wp-json': {
        target: 'http://headless-property-wp.local', // <<== VERVANG DEZE REGEL!
        changeOrigin: true,
        secure: false,
      }
    }
  }
})