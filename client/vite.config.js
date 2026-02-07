import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Listen on all IPs (0.0.0.0)
    port: 80,    // Standard HTTP port (no :5173 needed)
    strictPort: true,
  }
})
