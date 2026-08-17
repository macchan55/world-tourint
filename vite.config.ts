import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: 'https://wnjnrmxkgclzdydrazdg.supabase.co/storage/v1/object/public/site/',
  plugins: [react()],
})
