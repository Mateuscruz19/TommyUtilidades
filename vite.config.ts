import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Note: API calls go directly to localhost:3000 when using dev:api
  // No proxy needed - frontend calls the API server directly
})

