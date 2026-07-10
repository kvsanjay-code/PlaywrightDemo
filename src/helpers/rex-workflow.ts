/**
 * rex-workflow.ts
 *
 * Step helpers for the REX workflow.  Each function sends one SOAP operation,
 * asserts success, and returns the data tests need for the next step.
 *
 * Usage pattern:
 *   const order  = await orderStep(soapClient, orderPayload);
 *   const lodge  = await lodgeStep(soapClient, { ...lodgePayload, identification: toIdentification(order) });
 *   const state  = await readRexStep(soapClient, lodge.rexNumber);   // after staff portal action
 *   const amend  = await amendStep(soapClient, { identification: toIdentification(state), ... });
 */

import { SoapClient, SoapSuccessResult, SoapResult, ParsedCustomCertLine } from '../soap';
import {
  OrderRexPayload,
  LodgeRexPayload,
  AmendRexPayload,
  ReplaceCertificatePayload,
  ReleaseRexToPrintPayload,
  LodgeCustomCertificatePayload,
  ReleaseCustomCertificateToPrintPayload,
  Identification,
} from '../interfaces';

// ─── Shared types ─────────────────────────────────────────────────────────────

/** The minimum data tests carry between SOAP steps. */
export interface RexState {
  rexNumber: string;
  lastAmendmentTimestamp: string;
}

/** Result returned by replaceStep — REPLACE response has no rexNumber/timestamp. */
export interface ReplaceResult {
  serviceRequestId?: string;
  notices: { noticeId: string; noticeType: string; noticeMessage: string }[];
}

/** Result returned by lodgeCustomCertificateStep. */
export interface LodgeCustomCertificateResult {
  customCertificateRequestId?: string;
  complianceStatus?: string;
  lastAmendmentTimestamp?: string;
  exporterReference?: string;
  customCertificateLines: ParsedCustomCertLine[];
  notices: { noticeId: string; noticeType: string; noticeMessage: string }[];
}

/** Result returned by releaseCustomCertificateToPrintStep. */
export interface ReleaseCustomCertificateToPrintResult {
  customCertificateRequestId?: string;
  complianceStatus?: string;
  permitNumber?: string;
  lastAmendmentTimestamp?: string;
  notices: { noticeId: string; noticeType: string; noticeMessage: string }[];
}

/** Result returned by releaseRexToPrintStep. */
export interface ReleaseRexToPrintResult {
  rexNumber?:        string;
  complianceStatus?: string;
  permitNumber?:     string;
  exporterReference?: string;
  notices:           { noticeId: string; noticeType: string; noticeMessage: string }[];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Narrows a SoapResult to SoapSuccessResult or throws a descriptive error.
 * Using a plain throw (not Playwright expect) keeps helpers usable outside tests too.
 */
function assertSuccess(operation: string, result: SoapResult): asserts result is SoapSuccessResult {
  if (!result.success) {
    const errors = result.faultItems.length
      ? '\n  ' + result.faultItems.map(e => `[${e.faultCode}] ${e.faultMessage} (${e.faultReason})`).join('\n  ')
      : '';
    throw new Error(`${operation} SOAP fault — [${result.faultCode}] ${result.faultString}${errors}`);
  }
}

function requireField(operation: string, field: string, value: string | undefined): string {
  if (!value) throw new Error(`${operation} response missing expected field: ${field}`);
  return value;
}

function toState(operation: string, result: SoapSuccessResult): RexState {
  return {
    rexNumber:              requireField(operation, 'rexNumber',              result.rexNumber),
    lastAmendmentTimestamp: requireField(operation, 'lastAmendmentTimestamp', result.lastAmendmentTimestamp),
  };
}

// ─── Exported utilities ───────────────────────────────────────────────────────

/**
 * Extracts rexNumber + lastAmendmentTimestamp from a SoapSuccessResult into a RexState.
 * Use this when you need to do assertions on the raw result before passing state to the next step.
 */
export function toRexState(result: SoapSuccessResult): RexState {
  return {
    rexNumber:              requireField('toRexState', 'rexNumber',              result.rexNumber),
    lastAmendmentTimestamp: requireField('toRexState', 'lastAmendmentTimestamp', result.lastAmendmentTimestamp),
  };
}

/**
 * Converts a RexState into the Identification object required by AMEND and REPLACE.
 * Maps lastAmendmentTimestamp → lastAmendDateTime (the field name used in payloads).
 */
export function toIdentification(state: RexState): Identification {
  return {
    rexNumber:         state.rexNumber,
    lastAmendDateTime: state.lastAmendmentTimestamp,
  };
}

// ─── Workflow step functions ──────────────────────────────────────────────────

/**
 * Sends an ORDER request.
 * Returns the rexNumber + lastAmendmentTimestamp to pass into the subsequent LODGE.
 */
export async function orderStep(client: SoapClient, payload: OrderRexPayload): Promise<RexState> {
  const result = await client.orderRex(payload);
  assertSuccess('ORDER', result);
  return toState('ORDER', result);
}

/**
 * Sends a LODGE request.
 * Returns rexNumber + lastAmendmentTimestamp — the core state used by all subsequent steps.
 */
export async function lodgeStep(client: SoapClient, payload: LodgeRexPayload): Promise<RexState> {
  const result = await client.lodgeRex(payload);
  assertSuccess('LODGE', result);
  return toState('LODGE', result);
}

/**
 * Calls ReadRex to fetch the latest state of a REX record.
 * Must be called after any staff portal action before sending AMEND or REPLACE,
 * to ensure lastAmendmentTimestamp is current.
 */
export async function readRexStep(client: SoapClient, rexNumber: string): Promise<RexState> {
  const result = await client.readRex({ rexNumber });
  assertSuccess('READ_REX', result);
  return {
    rexNumber,
    lastAmendmentTimestamp: requireField('READ_REX', 'lastAmendmentTimestamp', result.lastAmendmentTimestamp),
  };
}

/**
 * Sends an AMEND request.
 * Payload must include identification built via toIdentification(currentState).
 * Returns updated rexNumber + lastAmendmentTimestamp.
 */
export async function amendStep(client: SoapClient, payload: AmendRexPayload): Promise<RexState> {
  const result = await client.amendRex(payload);
  assertSuccess('AMEND', result);
  return toState('AMEND', result);
}

/**
 * Sends a ReleaseRexToPrinter request.
 * Expects a fresh RexState — call readRexStep after any portal action before invoking this.
 * Returns compliance status, notices, and the updated REX details.
 */
export async function releaseRexToPrintStep(client: SoapClient, state: RexState): Promise<ReleaseRexToPrintResult> {
  const payload: ReleaseRexToPrintPayload = {
    rexNumber:         state.rexNumber,
    lastAmendDateTime: state.lastAmendmentTimestamp,
  };
  const result = await client.releaseRexToPrint(payload);
  assertSuccess('RELEASE_REX_TO_PRINT', result);
  return {
    rexNumber:         result.rexNumber,
    complianceStatus:  result.complianceStatus,
    permitNumber:      result.permitNumber,
    exporterReference: result.exporterReferences,
    notices:           result.notices,
  };
}

/**
 * Converts a LodgeCustomCertificateResult into the identification payload required by
 * ReleaseCustomCertificateToPrint. Maps lastAmendmentTimestamp → lastAmendDateTime.
 */
export function toCustomCertIdentification(result: LodgeCustomCertificateResult): ReleaseCustomCertificateToPrintPayload {
  return {
    customCertificateRequestId: requireField('toCustomCertIdentification', 'customCertificateRequestId', result.customCertificateRequestId),
    lastAmendDateTime:          requireField('toCustomCertIdentification', 'lastAmendmentTimestamp',     result.lastAmendmentTimestamp),
  };
}

/**
 * Calls CustomCertificateService.LodgeCustomCertificateDetails.
 * Flow: LODGE (printIndicator=C) → staff portal authorise → lodgeCustomCertificateStep.
 * productLines must include the rexNumber from the LODGE response and netQuantity from the REX.
 */
export async function lodgeCustomCertificateStep(
  client: SoapClient,
  payload: LodgeCustomCertificatePayload,
): Promise<LodgeCustomCertificateResult> {
  const result = await client.lodgeCustomCertificate(payload);
  assertSuccess('LODGE_CUSTOM_CERTIFICATE', result);
  return {
    customCertificateRequestId: result.customCertificateRequestId,
    complianceStatus:           result.complianceStatus,
    lastAmendmentTimestamp:     result.lastAmendmentTimestamp,
    exporterReference:          result.exporterReferences,
    customCertificateLines:     result.customCertificateLines,
    notices:                    result.notices,
  };
}

/**
 * Calls CustomCertificateService.ReleaseCustomCertificateToPrint.
 * Must be called after lodgeCustomCertificateStep — pass toCustomCertIdentification(certResult)
 * to build the payload from the lodge response.
 */
export async function releaseCustomCertificateToPrintStep(
  client: SoapClient,
  payload: ReleaseCustomCertificateToPrintPayload,
): Promise<ReleaseCustomCertificateToPrintResult> {
  const result = await client.releaseCustomCertificateToPrint(payload);
  assertSuccess('RELEASE_CUSTOM_CERTIFICATE_TO_PRINT', result);
  return {
    customCertificateRequestId: result.customCertificateRequestId,
    complianceStatus:           result.complianceStatus,
    permitNumber:               result.permitNumber,
    lastAmendmentTimestamp:     result.lastAmendmentTimestamp,
    notices:                    result.notices,
  };
}

/**
 * Sends a REPLACE request.
 * rexDetails.identification must be built via toIdentification(currentState).
 * Returns serviceRequestId and validation notices.
 */
export async function replaceStep(client: SoapClient, payload: ReplaceCertificatePayload): Promise<ReplaceResult> {
  const result = await client.replaceCertificate(payload);
  assertSuccess('REPLACE', result);
  return {
    serviceRequestId: result.serviceRequestId,
    notices: result.notices,
  };
}
