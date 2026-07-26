import { defineConfig, configDefaults } from 'vitest/config'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

export default defineConfig({
  // Matches tsconfig's "jsx": "react-jsx" (the automatic runtime — no
  // `import React` needed). Vite/esbuild's own default is the classic
  // runtime, which would fail with "React is not defined" on every .tsx
  // test otherwise.
  esbuild: {
    jsx: 'automatic',
  },
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
    // Component/hook tests need a DOM; backend/common stay on the faster
    // default "node" environment since they never touch one.
    environmentMatchGlobs: [
      ['packages/frontend/**', 'jsdom'],
    ],
    // Registers @testing-library/jest-dom's matchers (toBeInTheDocument,
    // toBeDisabled, etc). Safe to load for every test file, not just
    // frontend's — it only calls expect.extend(), no DOM access at import
    // time — so this doesn't need per-project scoping.
    setupFiles: ['./packages/frontend/src/testHelpers/setupTests.ts'],
  },
})