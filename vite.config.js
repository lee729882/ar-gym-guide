import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 같은 와이파이의 폰에서 접속하려면 npm run dev:host
    host: true,
    port: 5173,
  },
})
