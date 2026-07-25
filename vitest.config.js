import { defineConfig, configDefaults } from 'vitest/config'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export default defineConfig({
  test: {
    // Integration tests need a real Postgres and run separately via
    // `bun run test:integration` (see vitest.integration.config.ts) — keep
    // the default `bun run test` DB-free and fast.
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
  },
})