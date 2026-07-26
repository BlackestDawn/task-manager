import { defineConfig, devices } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_HEALTH_URL = 'http://localhost:3020/health';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Postgres (and migrations) are managed by scripts/run-e2e-tests.sh before
  // Playwright starts — these two just start the already-built services and
  // wait for them to answer, inheriting DB_URL/PLATFORM/JWT_SECRET from the
  // shell that invoked `playwright test`.
  webServer: [
    {
      // Must run with cwd packages/backend — db/index.ts resolves its
      // migrations folder as the relative path "./src/db/migrations",
      // relative to the process's CWD rather than the script file.
      command: 'bun dist/index.js',
      cwd: './packages/backend',
      url: BACKEND_HEALTH_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: { PORT: '3020' },
    },
    {
      // next start also reads PORT — pin it explicitly so it can't inherit
      // the backend's PORT=3020 from the shell environment.
      command: 'bun run start',
      cwd: './packages/frontend',
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: { PORT: '3000' },
    },
  ],
});
