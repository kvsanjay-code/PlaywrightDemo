/**
 * base-fixtures.ts
 *
 * Extends Playwright's base `test` with fixtures shared across all REX tests:
 *
 *   soapClient     — a SoapClient initialised with the active environment credentials.
 *   loginPage      — LoginPage (handles SIT/SIT2 login variants).
 *   rexSearchPage  — RexSearchPage (search by REX number).
 *   rexDetailPage  — RexDetailPage (inspect, authorise, status).
 *   authoriseRex   — one-call helper: login → search → inspect → authorise.
 *
 * All tests should import { test, expect } from '../fixtures' rather than
 * from '@playwright/test' directly so they automatically get these fixtures.
 */

import { test as base } from '@playwright/test';
import { SoapClient } from '../soap';
import { LoginPage, RexSearchPage, RexDetailPage } from '../pages';
import { config } from '../config/environment';
import { createAuthoriseRex, AuthoriseRexFn } from '../helpers/portal-workflow';

// ─── Fixture type declarations ────────────────────────────────────────────────

type RexFixtures = {
  /** SOAP client pre-configured with credentials from the active environment (.env.sit / .env.sit2 / .env.vnd). */
  soapClient: SoapClient;
  /** Login page object — handles SIT and SIT2 login form variants. */
  loginPage: LoginPage;
  /** REX search page object — search by REX number. */
  rexSearchPage: RexSearchPage;
  /** REX detail page object — inspection, authorisation, status. */
  rexDetailPage: RexDetailPage;
  /** One-call portal workflow: login → search → inspect → authorise. */
  authoriseRex: AuthoriseRexFn;
};

// ─── Extended test object ─────────────────────────────────────────────────────

export const test = base.extend<RexFixtures>({
  soapClient: async ({}, use) => {
    await use(new SoapClient(config));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page, config.staffPortalUrl, config.env));
  },

  rexSearchPage: async ({ page }, use) => {
    await use(new RexSearchPage(page));
  },

  rexDetailPage: async ({ page }, use) => {
    await use(new RexDetailPage(page));
  },

  authoriseRex: async ({ loginPage, rexSearchPage, rexDetailPage }, use) => {
    await use(createAuthoriseRex(loginPage, rexSearchPage, rexDetailPage));
  },
});

export { expect } from '@playwright/test';
