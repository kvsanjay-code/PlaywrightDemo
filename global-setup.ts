/**
 * global-setup.ts
 *
 * Runs once per `npx playwright test` invocation — before any worker or test
 * starts, regardless of --workers or --repeat-each. Reuses the previously
 * saved Staff Portal session from STAFF_PORTAL_AUTH_FILE if one exists and is
 * still valid (loginIfNeeded() tries the portal URL directly first), so a
 * real login only happens the first time ever, or after the saved session has
 * expired — NOT on every separate command invocation. This matters because
 * running "100 in batches of 6" as several separate `npx playwright test`
 * commands means globalSetup runs once per command; without reusing the
 * saved session, that's a fresh login per batch, which is exactly what was
 * locking the account even though each individual batch wasn't itself
 * running logins in parallel.
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium } from '@playwright/test';
import { STAFF_PORTAL_AUTH_FILE } from './src/config/auth-state';
import { config } from './src/config/environment';
import { LoginPage } from './src/pages/staff-portal/login.page';

export default async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext(
    fs.existsSync(STAFF_PORTAL_AUTH_FILE) ? { storageState: STAFF_PORTAL_AUTH_FILE } : {},
  );
  const page = await context.newPage();

  const loginPage = new LoginPage(page, config.staffPortalLoginUrl, config.staffPortalUrl, config.env);
  await loginPage.loginIfNeeded(config.staffUsername, config.staffPassword);

  fs.mkdirSync(path.dirname(STAFF_PORTAL_AUTH_FILE), { recursive: true });
  await context.storageState({ path: STAFF_PORTAL_AUTH_FILE });

  await browser.close();
}
