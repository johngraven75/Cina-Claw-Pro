import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // Each spec receives isolated HOME/user-data directories; bounded parallelism keeps
  // the Electron matrix below the hosted timeout without sharing application state.
  workers: process.env.CI ? 3 : 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [
    ...(process.env.CI ? [['./tests/e2e/progress-reporter.mjs'] as const] : []),
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
