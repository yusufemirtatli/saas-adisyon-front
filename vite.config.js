import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Development server'da tüm route'ları index.html'e yönlendir
    // Böylece /tables gibi route'lar 404 vermez
  },
})
