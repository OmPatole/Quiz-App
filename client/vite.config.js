import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // This enables listening on all IPs (0.0.0.0)
    port: 5173, // Default port (you can change this if needed)
    strictPort: true, // Ensures it fails if port 5173 is busy, rather than switching
  }
})