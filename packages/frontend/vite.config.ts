import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Keep your existing configuration for accessing common package
  resolve: {
    alias: {
      // Preserve any existing aliases for your common package
      '@common': path.resolve(__dirname, '../common/src'),
      // or whatever structure you're using
    }
  },
  // Keep any other existing config
})
