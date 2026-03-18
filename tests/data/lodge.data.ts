/**
 * lodge.data.ts — LODGE payload builders.
 */

import { LodgeRexPayload } from '../../src/interfaces';
import { PayloadOverrides, o } from './payload-overrides';
import { COMMODITY_TYPE, PACK_TYPE, PRESERVATION, DEFAULTS, buildDefaultExportDetails, buildDefaultProductLines } from './rex-defaults';

/**
 * Builds a minimal LODGE payload with only the required fields.
 */
export function buildLodgePayload(
  destinationCountry: string,
  productType: string,
  departureDate: string,
): LodgeRexPayload {
  return {
    payloadType: 'LODGE',
    exportDetails: {
      commodityType: COMMODITY_TYPE,
      destinationCountry,
      departureDate,
    },
    productLines: {
      productLine: [
        {
          lineNumber:     '1',
          productDetails: {
            productType,
            packType:         PACK_TYPE,
            preservationType: PRESERVATION,
          },
        },
      ],
    },
  };
}

/**
 * Builds a fully populated default LODGE payload.
 * Pass null for any field to explicitly omit it from the payload.
 *
 * @example
 * buildDefaultLodgePayload({ departureDate: null })          // omit departure date
 * buildDefaultLodgePayload({ destinationCountry: 'GB', printIndicator: PrintIndicator.Manual })
 */
export function buildDefaultLodgePayload(overrides: PayloadOverrides = {}): LodgeRexPayload {
  const printIndicator = o(DEFAULTS.printIndicator, overrides.printIndicator);

  return {
    payloadType:    'LODGE',
    exportDetails:  buildDefaultExportDetails(overrides),
    certificateDetails: {
      certificatePrintControls: {
        certificatePrintIndicator: printIndicator,
      },
    },
    productLines:   buildDefaultProductLines(overrides),
  };
}
