import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  test: {
    include: ['**/*.integration.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globalSetup: ['./packages/backend/src/db/testHelpers/globalSetup.ts'],
    // Query builder tests share one Postgres instance and isolate via
    // per-test transactions (see testHelpers/testDb.ts) rather than
    // separate databases, so files must not run concurrently against it.
    fileParallelism: false,
  },
})
