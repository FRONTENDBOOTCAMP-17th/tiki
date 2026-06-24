import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3201',
    screenshot: 'on',
    video: 'off',
  },
  outputDir: './test-results',
});
