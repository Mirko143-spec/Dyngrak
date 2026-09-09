import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'node',
      // Ladda .env så att import.meta.env.VITE_* är tillgängliga i tester
      env: {
        VITE_LLM_API_KEY: env.VITE_LLM_API_KEY ?? '',
        VITE_LLM_API_URL: env.VITE_LLM_API_URL ?? '',
      },
    },
  }
})

