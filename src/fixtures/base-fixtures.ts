/**
 * base-fixtures.ts
 *
 * Extends Playwright's base `test` with fixtures shared across all REX tests:
 *
 *   soapClient                   — a SoapClient initialised with the active environment credentials.
 *   loginPage                    — LoginPage (handles SIT/SIT2 login variants).
 *   rexSearchPage                — RexSearchPage (search by REX number).
 *   rexDetailPage                — RexDetailPage (inspect, authorise, status).
 *   authoriseRex                 — one-call helper: login → search → inspect → authorise → logout.
 *   staffPortalHeader             — StaffPortalHeader (Staff Portal/NEXDOC user menu — sign out).
 *   ecertLoginPage               — ECertLoginPage (eCert portal login).
 *   ecertHomePage                — ECertHomePage (links through to certificate search).
 *   ecertSearchPage              — ECertSearchPage (search by certificate number).
 *   ecertCertificateDetailsPage  — ECertCertificateDetailsPage (download, confirm, print, status).
 *   downloadCertificateXml       — one-call helper: login → home → search → download certificate XML.
 *   tasksPage                    — TasksPage (Staff Portal/NEXDOC Tasks list — search, open a task).
 *   taskDetailPage               — TaskDetailPage (approve/reject a task; approve opens a new tab).
 *   approveReplaceTask           — one-call helper: login → Tasks → open task → approve → replace-certificate new-tab flow.
 *   approveCancelTask            — one-call helper: login → Exports → Tasks → open task → approve (no new tab).
 *   pemsLoginPage                — PemsLoginPage (PEMS/Self Service login, ADF splash + OAM retry handled).
 *   pemsPortalHomePage           — PemsPortalHomePage (Self Service landing page — links through to PEMS).
 *   pemsHomePage                 — PemsHomePage (PEMS app home — create-inspection tiles).
 *   pemsInspectionPage           — PemsInspectionPage (Horticulture inspection detail steps).
 *   grainInspectionPage          — GrainInspectionPage (Grain inspection detail steps).
 *   pemsTimeEntryPage            — PemsTimeEntryPage (Time Entry tab).
 *   addHorticultureInspection    — one-call helper: login → open PEMS → create Horticulture inspection → fill details → submit.
 *   addGrainInspection           — one-call helper: login → open PEMS → create Grain inspection → fill details → submit.
 *   pemsRexPage                  — PemsRexPage (PEMS REX search, request authorisation).
 *   pemsHeader                   — PemsHeader (back to Self Service, shown on every PEMS screen).
 *   pemsLogoutPage               — PemsLogoutPage (logout confirmation).
 *
 * All tests should import { test, expect } from '../fixtures' rather than
 * from '@playwright/test' directly so they automatically get these fixtures.
 */

import { test as base } from '@playwright/test';
import { SoapClient } from '../soap';
import {
  LoginPage, RexSearchPage, RexDetailPage, StaffPortalHeader,
  ECertLoginPage, ECertHomePage, ECertSearchPage, ECertCertificateDetailsPage,
  TasksPage, TaskDetailPage,
  PemsLoginPage, PemsPortalHomePage, PemsHomePage, PemsInspectionPage, GrainInspectionPage, PemsTimeEntryPage,
  PemsRexPage, PemsHeader, PemsLogoutPage,
} from '../pages';
import { config } from '../config/environment';
import { createAuthoriseRex, AuthoriseRexFn } from '../helpers/portal-workflow';
import { createDownloadCertificateXml, DownloadCertificateXmlFn } from '../helpers/ecert-workflow';
import { createApproveReplaceTask, ApproveReplaceTaskFn, createApproveCancelTask, ApproveCancelTaskFn } from '../helpers/staff-portal-tasks-workflow';
import { createAddHorticultureInspection, AddHorticultureInspectionFn, createAddGrainInspection, AddGrainInspectionFn } from '../helpers/pems-workflow';

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
  /** One-call portal workflow: login → search → inspect → authorise → logout. */
  authoriseRex: AuthoriseRexFn;
  /** Staff Portal/NEXDOC user menu (top right) — sign out. */
  staffPortalHeader: StaffPortalHeader;

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
  /** One-call Staff Portal workflow: login → Tasks → open task → approve → replace-certificate new-tab flow. */
  approveReplaceTask: ApproveReplaceTaskFn;
  /** One-call Staff Portal workflow: login → Exports → Tasks → open task → approve (no new tab). */
  approveCancelTask: ApproveCancelTaskFn;

  /** PEMS/Self Service login page object — ADF splash fix + OAM "System error" retry. */
  pemsLoginPage: PemsLoginPage;
  /** Self Service landing page object — links through to PEMS. */
  pemsPortalHomePage: PemsPortalHomePage;
  /** PEMS app home page object — create-inspection tiles. */
  pemsHomePage: PemsHomePage;
  /** PEMS Horticulture inspection detail page object. */
  pemsInspectionPage: PemsInspectionPage;
  /** PEMS Grain inspection detail page object. */
  grainInspectionPage: GrainInspectionPage;
  /** PEMS Time Entry tab page object. */
  pemsTimeEntryPage: PemsTimeEntryPage;
  /** One-call PEMS workflow: login → open PEMS → create Horticulture inspection → fill details → submit. */
  addHorticultureInspection: AddHorticultureInspectionFn;
  /** One-call PEMS workflow: login → open PEMS → create Grain inspection → fill details → submit. */
  addGrainInspection: AddGrainInspectionFn;

  /** PEMS REX search page object — search, request authorisation. */
  pemsRexPage: PemsRexPage;
  /** PEMS header component — back to Self Service, shown on every PEMS screen. */
  pemsHeader: PemsHeader;
  /** Self Service logout confirmation page object. */
  pemsLogoutPage: PemsLogoutPage;
};

// ─── Extended test object ─────────────────────────────────────────────────────

export const test = base.extend<RexFixtures>({
  soapClient: async ({}, use) => {
    await use(new SoapClient(config));
  },

  loginPage: async ({ page }, use, testInfo) => {
    if (testInfo.config.workers > 1) {
      throw new Error(
        'Staff Portal tests must run with workers=1. OAM does not tolerate the same saved session being used ' +
        'from multiple concurrent browser contexts — each one independently appears unauthenticated and ' +
        'triggers its own real login, and those simultaneous real logins are what locks the account. ' +
        'Drop --workers/--fully-parallel for any run that touches the Staff Portal (authoriseRex, ' +
        'approveReplaceTask, approveCancelTask, etc.) — reserve parallel workers for SOAP-only tests.',
      );
    }
    await use(new LoginPage(page, config.staffPortalLoginUrl, config.staffPortalUrl, config.env));
  },

  rexSearchPage: async ({ page }, use) => {
    await use(new RexSearchPage(page));
  },

  rexDetailPage: async ({ page }, use) => {
    await use(new RexDetailPage(page));
  },

  authoriseRex: async ({ loginPage, rexSearchPage, rexDetailPage, staffPortalHeader }, use) => {
    await use(createAuthoriseRex(loginPage, rexSearchPage, rexDetailPage, staffPortalHeader));
  },

  staffPortalHeader: async ({ page }, use) => {
    await use(new StaffPortalHeader(page));
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

  approveCancelTask: async ({ loginPage, rexSearchPage, tasksPage, taskDetailPage }, use) => {
    await use(createApproveCancelTask(loginPage, rexSearchPage, tasksPage, taskDetailPage));
  },

  pemsLoginPage: async ({ page }, use) => {
    await use(new PemsLoginPage(page, config.pemsUrl));
  },

  pemsPortalHomePage: async ({ page }, use) => {
    await use(new PemsPortalHomePage(page));
  },

  pemsHomePage: async ({ page }, use) => {
    await use(new PemsHomePage(page));
  },

  pemsInspectionPage: async ({ page }, use) => {
    await use(new PemsInspectionPage(page));
  },

  grainInspectionPage: async ({ page }, use) => {
    await use(new GrainInspectionPage(page));
  },

  pemsTimeEntryPage: async ({ page }, use) => {
    await use(new PemsTimeEntryPage(page));
  },

  addHorticultureInspection: async (
    { pemsLoginPage, pemsPortalHomePage, pemsHomePage, pemsInspectionPage, pemsTimeEntryPage, pemsRexPage, pemsHeader, pemsLogoutPage },
    use,
  ) => {
    await use(
      createAddHorticultureInspection(
        pemsLoginPage, pemsPortalHomePage, pemsHomePage, pemsInspectionPage, pemsTimeEntryPage,
        pemsRexPage, pemsHeader, pemsLogoutPage,
      ),
    );
  },

  addGrainInspection: async (
    { pemsLoginPage, pemsPortalHomePage, pemsHomePage, grainInspectionPage, pemsTimeEntryPage, pemsRexPage, pemsHeader, pemsLogoutPage },
    use,
  ) => {
    await use(
      createAddGrainInspection(
        pemsLoginPage, pemsPortalHomePage, pemsHomePage, grainInspectionPage, pemsTimeEntryPage,
        pemsRexPage, pemsHeader, pemsLogoutPage,
      ),
    );
  },

  pemsRexPage: async ({ page }, use) => {
    await use(new PemsRexPage(page));
  },

  pemsHeader: async ({ page }, use) => {
    await use(new PemsHeader(page));
  },

  pemsLogoutPage: async ({ page }, use) => {
    await use(new PemsLogoutPage(page));
  },
});

export { expect } from '@playwright/test';
