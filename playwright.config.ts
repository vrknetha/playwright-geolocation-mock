import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    geolocation: { latitude: 0, longitude: 0 },
    permissions: ['geolocation'],
    viewport: { width: 1280, height: 720 },
    navigationTimeout: 15000,
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          geolocation: { latitude: 0, longitude: 0 },
          permissions: ['geolocation'],
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        contextOptions: {
          geolocation: { latitude: 0, longitude: 0 },
          permissions: ['geolocation'],
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        contextOptions: {
          geolocation: { latitude: 0, longitude: 0 },
          permissions: ['geolocation'],
        }
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        contextOptions: {
          geolocation: { latitude: 0, longitude: 0 },
          permissions: ['geolocation'],
        }
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        contextOptions: {
          geolocation: { latitude: 0, longitude: 0 },
          permissions: ['geolocation'],
        }
      },
    },
  ],
}); 