/**
 * pems-workflow.ts
 *
 * Reusable PEMS (Plant Exports Management System) workflow helpers.
 */

import { PemsLoginPage, PemsPortalHomePage, PemsHomePage, PemsInspectionPage, GrainInspectionPage, PemsTimeEntryPage } from '../pages';
import { config } from '../config/environment';

export interface HorticultureInspectionDetails {
  placeOfOrigin: string;
  flowPath: { result: string; resultTime: string };
  outcome: { samplingRate: string };
  lineResult: { line: string; sampled: string; result: string };
  timeEntry: { start: string; end: string };
}

export type AddHorticultureInspectionFn = (rexNumber: string, details: HorticultureInspectionDetails) => Promise<string>;

/**
 * Creates and completes a Horticulture inspection in PEMS for the given REX number:
 *
 *   login (if needed) -> open PEMS -> create Horticulture inspection for rexNumber ->
 *   update REX details -> update flow path -> update outcome -> record line result ->
 *   add time entry -> submit.
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
 * Creates and completes a Grain and Plant Product inspection in PEMS for the given REX number:
 *
 *   login (if needed) -> open PEMS -> create Grain inspection for rexNumber ->
 *   update flow path -> update outcome -> declare -> record line result ->
 *   add time entry -> submit.
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

    return inspectionId;
  };
}
