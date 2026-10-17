
require('dotenv').config();

const { defineConfig } = require('@playwright/test');

const browser = (process.env.BROWSER || 'chrome').toLowerCase();

const browserConfig = {
  chrome: { channel: 'chrome' },
  edge: { channel: 'msedge' },
};

if (!browserConfig[browser]) {
  throw new Error('Invalid BROWSER. Use chrome or edge.');
}

const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

if (!username || !password) {
  throw new Error(
    'Set BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD in .env'
  );
}

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  use: {
    ...browserConfig[browser],
    browserName: 'chromium',
    headless: false,

    // Open the browser maximized.
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },

    // Application URL and authentication.
    baseURL: process.env.BASE_URL || 'https://uae.sdgstage.com/',
    httpCredentials: {
      username,
      password,
    },

    // Test artifacts and timeouts.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
});
