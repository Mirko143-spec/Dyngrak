import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    // Ladda .env så att import.meta.env.VITE_* är tillgängliga i tester
    env: {
      VITE_LLM_API_KEY: process.env.VITE_LLM_API_KEY ?? '',
      VITE_LLM_API_URL: process.env.VITE_LLM_API_URL ?? '',
    },
  },
})
