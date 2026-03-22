import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment-specific .env file based on ENV variable (default: sit)
const env = (process.env.ENV || 'sit').toLowerCase();
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [['html', { open: 'on-failure' }]],

  use: {
    // Used for staff portal UI steps
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
