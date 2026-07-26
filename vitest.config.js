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
    // the default `bun run test` DB-free and fast. E2E specs (also
    // *.spec.ts, which vitest's default include would otherwise match) run
    // via Playwright through `bun run test:e2e`, not vitest.
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts', 'e2e/**'],
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        ...configDefaults.coverage.exclude,
        '**/*.test.{ts,tsx}',
        '**/*.integration.test.ts',
        '**/testHelpers/**',
        '**/db/migrations/**',
        // Barrel re-export files — trivial pass-throughs unit tests never
        // import directly, so they'd otherwise show as 0% for no signal.
        'packages/*/src/index.ts',
        // DB query builders are exercised by the real-Postgres integration
        // suite (test:integration), not this unit run — counting them here
        // would just show a permanent 0%.
        'packages/backend/src/db/queries/**',
        // Next.js route wiring (page/layout/route.ts) and Hono route
        // registration are thin composition over already-tested
        // components/handlers — see this session's earlier judgment call
        // that these are wiring, not logic worth unit-testing directly.
        'packages/frontend/src/app/**',
        '**/routes.ts',
        // Pure type/interface declarations — no runtime logic to cover.
        'packages/frontend/src/lib/data/interfaces.ts',
        'packages/frontend/src/lib/data/interfaces/**',
      ],
    },
  },
})