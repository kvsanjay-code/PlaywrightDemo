import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { STAFF_PORTAL_AUTH_FILE } from './src/config/auth-state';

// Load environment-specific .env file based on ENV variable (default: sit)
const env = (process.env.ENV || 'sit').toLowerCase();
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  timeout: 240_000,
  reporter: [['html', { open: 'on-failure' }]],

  // Logs into the Staff Portal once (see global-setup.ts) and saves the session,
  // so every test's browser context starts already authenticated instead of each
  // one submitting the login form independently — the actual fix for many
  // parallel/repeated tests logging in at the same time.
  globalSetup: require.resolve('./global-setup'),

  use: {
    // Used for staff portal UI steps
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    storageState: STAFF_PORTAL_AUTH_FILE,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
