import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendTarget = process.env.VITE_BACKEND_TARGET ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/v3/api-docs': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/swagger-ui': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
