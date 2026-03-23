/**
 * base-fixtures.ts
 *
 * Extends Playwright's base `test` with fixtures shared across all REX tests:
 *
 *   soapClient   — a SoapClient initialised with the active environment credentials.
 *
 * All tests should import { test, expect } from '../fixtures' rather than
 * from '@playwright/test' directly so they automatically get these fixtures.
 */

import { test as base } from '@playwright/test';
import { SoapClient } from '../soap';
import { StaffPortalPage } from '../pages';
import { config } from '../config/environment';

// ─── Fixture type declarations ────────────────────────────────────────────────

type RexFixtures = {
  /** SOAP client pre-configured with credentials from the active environment (.env.sit / .env.sit2 / .env.vnd). */
  soapClient: SoapClient;
  /** Staff Portal page object for hybrid SOAP + UI test flows. */
  staffPortalPage: StaffPortalPage;
};

// ─── Extended test object ─────────────────────────────────────────────────────

export const test = base.extend<RexFixtures>({
  soapClient: async ({}, use) => {
    await use(new SoapClient(config));
  },

  staffPortalPage: async ({ page }, use) => {
    await use(new StaffPortalPage(page, config.staffPortalUrl));
  },
});

export { expect } from '@playwright/test';
