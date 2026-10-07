/**
 * global-setup.ts
 *
 * Runs exactly once per `npx playwright test` invocation — before any worker
 * or test starts, regardless of --workers or --repeat-each — and logs into
 * the Staff Portal a single time, saving the authenticated session to
 * STAFF_PORTAL_AUTH_FILE. playwright.config.ts loads every test's browser
 * context with that saved state, so loginIfNeeded() sees an active session
 * immediately and skips the login form instead of submitting it again.
 *
 * This is what actually fixes "many parallel/repeated tests logging in at
 * the same time" — there is only ever one real login submission per run.
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium } from '@playwright/test';
import { STAFF_PORTAL_AUTH_FILE } from './src/config/auth-state';
import { config } from './src/config/environment';
import { LoginPage } from './src/pages/staff-portal/login.page';

export default async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page, config.staffPortalLoginUrl, config.staffPortalUrl, config.env);
  await loginPage.login(config.staffUsername, config.staffPassword);

  fs.mkdirSync(path.dirname(STAFF_PORTAL_AUTH_FILE), { recursive: true });
  await context.storageState({ path: STAFF_PORTAL_AUTH_FILE });

  await browser.close();
}
