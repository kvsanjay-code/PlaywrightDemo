/**
 * base-fixtures.ts
 *
 * Extends Playwright's base `test` with fixtures shared across all REX tests:
 *
 *   soapClient                   — a SoapClient initialised with the active environment credentials.
 *   loginPage                    — LoginPage (handles SIT/SIT2 login variants).
 *   rexSearchPage                — RexSearchPage (search by REX number).
 *   rexDetailPage                — RexDetailPage (inspect, authorise, status).
 *   authoriseRex                 — one-call helper: login → search → inspect → authorise.
 *   ecertLoginPage               — ECertLoginPage (eCert portal login).
 *   ecertHomePage                — ECertHomePage (links through to certificate search).
 *   ecertSearchPage              — ECertSearchPage (search by certificate number).
 *   ecertCertificateDetailsPage  — ECertCertificateDetailsPage (download, confirm, print, status).
 *   downloadCertificateXml       — one-call helper: login → home → search → download certificate XML.
 *   tasksPage                    — TasksPage (Staff Portal/NEXDOC Tasks list — search, open a task).
 *   taskDetailPage               — TaskDetailPage (approve/reject a task; approve opens a new tab).
 *   approveReplaceTask           — one-call helper: login → Tasks → open task → approve → replace-certificate popup flow.
 *
 * All tests should import { test, expect } from '../fixtures' rather than
 * from '@playwright/test' directly so they automatically get these fixtures.
 */

import { test as base } from '@playwright/test';
import { SoapClient } from '../soap';
import { LoginPage, RexSearchPage, RexDetailPage, ECertLoginPage, ECertHomePage, ECertSearchPage, ECertCertificateDetailsPage, TasksPage, TaskDetailPage } from '../pages';
import { config } from '../config/environment';
import { createAuthoriseRex, AuthoriseRexFn } from '../helpers/portal-workflow';
import { createDownloadCertificateXml, DownloadCertificateXmlFn } from '../helpers/ecert-workflow';
import { createApproveReplaceTask, ApproveReplaceTaskFn } from '../helpers/staff-portal-tasks-workflow';

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

  /** eCert login page object. */
  ecertLoginPage: ECertLoginPage;
  /** eCert home page object — links through to certificate search. */
  ecertHomePage: ECertHomePage;
  /** eCert certificate search page object. */
  ecertSearchPage: ECertSearchPage;
  /** eCert certificate details page object — download, confirm, print, status. */
  ecertCertificateDetailsPage: ECertCertificateDetailsPage;
  /** One-call eCert workflow: login → home → search → download certificate XML. */
  downloadCertificateXml: DownloadCertificateXmlFn;

  /** Staff Portal (NEXDOC) Tasks list page object — search, open a task. */
  tasksPage: TasksPage;
  /** Staff Portal (NEXDOC) Task detail page object — approve/reject; approve opens a new tab. */
  taskDetailPage: TaskDetailPage;
  /** One-call Staff Portal workflow: login → Tasks → open task → approve → replace-certificate popup flow. */
  approveReplaceTask: ApproveReplaceTaskFn;
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

  ecertLoginPage: async ({ page }, use) => {
    await use(new ECertLoginPage(page, config.ecertUrl));
  },

  ecertHomePage: async ({ page }, use) => {
    await use(new ECertHomePage(page));
  },

  ecertSearchPage: async ({ page }, use) => {
    await use(new ECertSearchPage(page));
  },

  ecertCertificateDetailsPage: async ({ page }, use) => {
    await use(new ECertCertificateDetailsPage(page));
  },

  downloadCertificateXml: async (
    { ecertLoginPage, ecertHomePage, ecertSearchPage, ecertCertificateDetailsPage },
    use,
  ) => {
    await use(
      createDownloadCertificateXml(ecertLoginPage, ecertHomePage, ecertSearchPage, ecertCertificateDetailsPage),
    );
  },

  tasksPage: async ({ page }, use) => {
    await use(new TasksPage(page));
  },

  taskDetailPage: async ({ page }, use) => {
    await use(new TaskDetailPage(page));
  },

  approveReplaceTask: async ({ loginPage, rexSearchPage, tasksPage, taskDetailPage }, use) => {
    await use(createApproveReplaceTask(loginPage, rexSearchPage, tasksPage, taskDetailPage));
  },
});

export { expect } from '@playwright/test';
