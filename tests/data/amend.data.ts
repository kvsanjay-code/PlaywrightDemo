/**
 * amend.data.ts — AMEND payload builders.
 *
 * AMEND requires identification (rexNumber + lastAmendDateTime) from a prior successful LODGE.
 * Use toIdentification(rexState) from src/helpers to build the identification object.
 */

import { AmendRexPayload } from '../../src/interfaces';
import { RexState, toIdentification } from '../../src/helpers';
import { PayloadOverrides, o } from './payload-overrides';
import { DEFAULTS, buildDefaultExportDetails, buildDefaultProductLines } from './rex-defaults';

/**
 * Builds a fully populated default AMEND payload.
 * Requires rexState (rexNumber + lastAmendmentTimestamp) from the prior LODGE response.
 * Pass null for any field to explicitly omit it from the payload.
 *
 * @example
 * const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
 * const amendPayload = buildDefaultAmendPayload(lodgeState, { productType: PRODUCT_TYPE.MANGO });
 */
export function buildDefaultAmendPayload(
  rexState: RexState,
  overrides: PayloadOverrides & {
    amendmentReason?:        string | null;
    submitAmendmentRequest?: string | null;
  } = {},
): AmendRexPayload {
  const printIndicator = o(DEFAULTS.printIndicator, overrides.printIndicator);

  return {
    identification:    toIdentification(rexState),
    exportDetails:     buildDefaultExportDetails(overrides),
    certificateDetails: {
      certificatePrintControls: {
        certificatePrintIndicator: printIndicator,
      },
    },
    productLines:      buildDefaultProductLines(overrides),
    amendmentReason:   o(undefined, overrides.amendmentReason)        ?? undefined,
    submitAmendmentRequest: o(undefined, overrides.submitAmendmentRequest) ?? undefined,
  };
}
