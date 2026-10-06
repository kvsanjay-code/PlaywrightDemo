/**
 * login-smoke.spec.ts
 *
 * PEMS login health check — no REX, no inspection. Login -> open PEMS -> wait 2s ->
 * log out. Exists to isolate whether a sign-in failure under parallel execution
 * (e.g. TC-PEMS01/TC-PEMS02 running concurrently) comes from login itself — Oracle
 * ADF's splash screen or Oracle Access Manager's intermittent "System error" are
 * both documented as more likely under parallel load — rather than from the
 * inspection flow. Run several of these in parallel to reproduce/verify:
 *
 *   npx playwright test tests/pems/login-smoke.spec.ts --repeat-each=6 --workers=6 --fully-parallel
 */

import { test } from 'src/fixtures';
import { config } from 'src/config/environment';

test('PEMS login smoke test — login -> open PEMS -> wait 2s -> log out', async ({
  pemsLoginPage,
  pemsPortalHomePage,
  pemsHomePage,
  pemsHeader,
  pemsLogoutPage,
}) => {
  await pemsLoginPage.loginIfNeeded(config.pemsUsername, config.pemsPassword);
  await pemsPortalHomePage.expectLoggedIn();

  await pemsPortalHomePage.openPems();
  await pemsHomePage.expectLoaded();

  await pemsPortalHomePage.stayIdle(2_000);

  await pemsHeader.backToSelfService();
  await pemsPortalHomePage.expectLoggedIn();
  await pemsPortalHomePage.logout();
  await pemsLogoutPage.expectLoggedOut();
});
