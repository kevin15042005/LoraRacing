import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // host: true permite entrar desde el celular en desarrollo (http://IP-del-PC:5173)
    host: true,
    // En desarrollo, todo lo que empiece por /api se envía al BackEnd
    proxy: { '/api': 'http://localhost:3000' },
  },
})
