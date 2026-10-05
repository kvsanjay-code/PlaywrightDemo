/**
 * pems-workflow.ts
 *
 * Reusable PEMS (Plant Exports Management System) workflow helpers.
 */

import { test } from '@playwright/test';
import {
  PemsLoginPage, PemsPortalHomePage, PemsHomePage, PemsInspectionPage, GrainInspectionPage, PemsTimeEntryPage,
  PemsRexPage, PemsHeader, PemsLogoutPage,
} from '../pages';
import { config } from '../config/environment';

const IDLE_BEFORE_LOGOUT_MS = 10_000;

/** Requests REX authorisation, then waits briefly and logs out. Shared by Horticulture and Grain. */
async function authoriseAndLogout(
  rexNumber: string,
  rexPage: PemsRexPage,
  pemsHeader: PemsHeader,
  portalHomePage: PemsPortalHomePage,
  logoutPage: PemsLogoutPage,
): Promise<void> {
  await test.step('Request authorisation of the REX', async () => {
    await rexPage.search(rexNumber);
    await rexPage.requestAuthorisation();
  });

  await test.step('Wait 10 seconds, then log out', async () => {
    await rexPage.stayIdle(IDLE_BEFORE_LOGOUT_MS);
    await pemsHeader.backToSelfService();
    await portalHomePage.expectLoggedIn();
    await portalHomePage.logout();
    await logoutPage.expectLoggedOut();
  });
}

export interface HorticultureInspectionDetails {
  placeOfOrigin: string;
  flowPath: { result: string; resultTime: string };
  outcome: { samplingRate: string };
  lineResult: { line: string; sampled: string; result: string };
  timeEntry: { start: string; end: string };
}

export type AddHorticultureInspectionFn = (rexNumber: string, details: HorticultureInspectionDetails) => Promise<string>;

/**
 * Creates and completes a Horticulture inspection in PEMS for the given REX number,
 * then requests REX authorisation and logs out:
 *
 *   login (if needed) -> open PEMS -> create Horticulture inspection for rexNumber ->
 *   update REX details -> update flow path -> update outcome -> record line result ->
 *   add time entry -> submit -> request REX authorisation -> wait 10s -> log out.
 *
 * Returns the PEMS inspection ID. Called once in the fixture — tests just use
 * addHorticultureInspection(rexNumber, details).
 */
export function createAddHorticultureInspection(
  loginPage: PemsLoginPage,
  portalHomePage: PemsPortalHomePage,
  pemsHomePage: PemsHomePage,
  inspectionPage: PemsInspectionPage,
  timeEntryPage: PemsTimeEntryPage,
  rexPage: PemsRexPage,
  pemsHeader: PemsHeader,
  logoutPage: PemsLogoutPage,
): AddHorticultureInspectionFn {
  return async (rexNumber: string, data: HorticultureInspectionDetails) => {
    await loginPage.loginIfNeeded(config.pemsUsername, config.pemsPassword);
    await portalHomePage.expectLoggedIn();

    await portalHomePage.openPems();
    await pemsHomePage.expectLoaded();

    const dialog = await pemsHomePage.openCreateHorticulture();
    await dialog.createWithRex(rexNumber);
    await inspectionPage.expectStatus('Active');
    const inspectionId = await inspectionPage.inspectionId();

    await inspectionPage.updateRexDetails({ placeOfOrigin: data.placeOfOrigin });
    await inspectionPage.updateFlowPath(data.flowPath);
    await inspectionPage.updateOutcome(data.outcome);
    await inspectionPage.recordLineResult(data.lineResult);

    await inspectionPage.openTimeEntryTab();
    await timeEntryPage.addTimeEntry(data.timeEntry);

    await inspectionPage.submit();

    await authoriseAndLogout(rexNumber, rexPage, pemsHeader, portalHomePage, logoutPage);

    return inspectionId;
  };
}

export interface GrainInspectionDetails {
  flowPath: { result: string; resultTime: string };
  outcome: { outcomeType: string; rate: string };
  lineResult: { line: string; weightPerPackage: string; unit: string; result: string; expectedLineWeight: string };
  timeEntry: { start: string; end: string };
}

export type AddGrainInspectionFn = (rexNumber: string, details: GrainInspectionDetails) => Promise<string>;

/**
 * Creates and completes a Grain and Plant Product inspection in PEMS for the given
 * REX number, then requests REX authorisation and logs out:
 *
 *   login (if needed) -> open PEMS -> create Grain inspection for rexNumber ->
 *   update flow path -> update outcome -> declare -> record line result ->
 *   add time entry -> submit -> request REX authorisation -> wait 10s -> log out.
 *
 * There is no "Update REX details" step for Grain (unlike Horticulture), and there's
 * an extra declaration step instead. Returns the PEMS inspection ID. Called once in
 * the fixture — tests just use addGrainInspection(rexNumber, details).
 */
export function createAddGrainInspection(
  loginPage: PemsLoginPage,
  portalHomePage: PemsPortalHomePage,
  pemsHomePage: PemsHomePage,
  grainInspectionPage: GrainInspectionPage,
  timeEntryPage: PemsTimeEntryPage,
  rexPage: PemsRexPage,
  pemsHeader: PemsHeader,
  logoutPage: PemsLogoutPage,
): AddGrainInspectionFn {
  return async (rexNumber: string, data: GrainInspectionDetails) => {
    await loginPage.loginIfNeeded(config.pemsUsername, config.pemsPassword);
    await portalHomePage.expectLoggedIn();

    await portalHomePage.openPems();
    await pemsHomePage.expectLoaded();

    const dialog = await pemsHomePage.openCreateGrain();
    await dialog.createWithRex(rexNumber);
    await grainInspectionPage.expectStatus('Active');
    const inspectionId = await grainInspectionPage.inspectionId();

    await grainInspectionPage.updateFlowPath(data.flowPath);
    await grainInspectionPage.updateGrainOutcome(data.outcome);
    await grainInspectionPage.declare();
    await grainInspectionPage.recordGrainLineResult(data.lineResult);

    await grainInspectionPage.openTimeEntryTab();
    await timeEntryPage.addTimeEntry(data.timeEntry);

    await grainInspectionPage.submit();

    await authoriseAndLogout(rexNumber, rexPage, pemsHeader, portalHomePage, logoutPage);

    return inspectionId;
  };
}
