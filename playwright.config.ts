import dns from 'node:dns'
import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

dns.setDefaultResultOrder('ipv4first')

const STORAGE_STATE = path.join(import.meta.dirname, 'tests/e2e/.auth/state.json')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'tests/e2e/.results/playwright-report', open: 'never' }],
    ['json', { outputFile: 'tests/e2e/.results/playwright-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5555',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        launchOptions: {
          args: ['--host-resolver-rules=MAP localhost 127.0.0.1'],
        },
      },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
        launchOptions: {
          args: ['--host-resolver-rules=MAP localhost 127.0.0.1'],
        },
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
})

export { STORAGE_STATE }
