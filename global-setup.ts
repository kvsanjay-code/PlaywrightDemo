/**
 * global-setup.ts
 *
 * Runs once per `npx playwright test` invocation — before any worker or test
 * starts, regardless of --workers or --repeat-each. Reuses the previously
 * saved Staff Portal session from STAFF_PORTAL_AUTH_FILE if one exists and is
 * still valid (loginIfNeeded() checks the portal URL first and skips submitting
 * credentials if a session is already active there), so a real login only
 * happens the first time ever, or after the saved session has expired — NOT on
 * every separate command invocation. This matters because running "100 in
 * batches of 6" as several separate `npx playwright test` commands means
 * globalSetup runs once per command; without reusing the saved session, that's
 * a fresh login per batch, which is exactly what was locking the account even
 * though each individual batch wasn't itself running logins in parallel.
 *
 * The whole thing is wrapped in a cross-process lock (STAFF_PORTAL_AUTH_LOCK_FILE)
 * so that even if two `npx playwright test` commands are started around the same
 * time and the saved session has expired, only one of them ever performs the
 * real OAM login — the second waits for the lock, then reloads the session the
 * first one just saved and skips logging in itself. Without this, two concurrent
 * real logins against OAM is exactly the "multiple users logging in at the same
 * time" pattern that locks the account.
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium } from '@playwright/test';
import { STAFF_PORTAL_AUTH_FILE, STAFF_PORTAL_AUTH_LOCK_FILE } from './src/config/auth-state';
import { config } from './src/config/environment';
import { LoginPage } from './src/pages/staff-portal/login.page';
import { withProcessLock } from './src/helpers/process-lock';

export default async function globalSetup(): Promise<void> {
  await withProcessLock(STAFF_PORTAL_AUTH_LOCK_FILE, async () => {
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
  });
}
