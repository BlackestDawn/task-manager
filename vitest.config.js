import { defineConfig, configDefaults } from 'vitest/config'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

export default defineConfig({
  resolve: {
    alias: {
      // Matches packages/frontend/tsconfig.json's baseUrl/paths ("@/*" ->
      // "./src/*") — tsc resolves this natively, but Vite/Vitest doesn't
      // read tsconfig paths on its own, so any test that imports a real
      // (unmocked) "@/..." module fails to resolve without this.
      '@': path.resolve(import.meta.dirname, 'packages/frontend/src'),
    },
  },
  test: {
    // Integration tests need a real Postgres and run separately via
    // `bun run test:integration` (see vitest.integration.config.ts) — keep
    // the default `bun run test` DB-free and fast.
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
  },
})