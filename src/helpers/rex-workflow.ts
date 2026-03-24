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

import { SoapClient, SoapSuccessResult, SoapResult } from '../soap';
import {
  OrderRexPayload,
  LodgeRexPayload,
  AmendRexPayload,
  ReplaceCertificatePayload,
  Identification,
} from '../interfaces';

// ─── Shared types ─────────────────────────────────────────────────────────────

/** The minimum data tests carry between SOAP steps. */
export interface RexState {
  rexNumber: string;
  lastAmendmentTimestamp: string;
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
 * Sends a REPLACE request.
 * rexDetails.identification must be built via toIdentification(currentState).
 * Returns updated rexNumber + lastAmendmentTimestamp.
 */
export async function replaceStep(client: SoapClient, payload: ReplaceCertificatePayload): Promise<RexState> {
  const result = await client.replaceCertificate(payload);
  assertSuccess('REPLACE', result);
  return toState('REPLACE', result);
}
