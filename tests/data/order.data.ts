/**
 * order.data.ts — ORDER payload builders.
 */

import { OrderRexPayload } from '../../src/interfaces';
import { PayloadOverrides } from './payload-overrides';
import { COMMODITY_TYPE, PACK_TYPE, PRESERVATION, buildDefaultExportDetails, buildDefaultProductLines } from './rex-defaults';

/**
 * Builds a minimal ORDER payload with only the required fields.
 */
export function buildOrderPayload(
  destinationCountry: string,
  productType: string,
  departureDate: string,
): OrderRexPayload {
  return {
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
 * Builds a fully populated default ORDER payload.
 * Pass null for any field to explicitly omit it from the payload.
 */
export function buildDefaultOrderPayload(overrides: PayloadOverrides = {}): OrderRexPayload {
  return {
    exportDetails: buildDefaultExportDetails(overrides),
    productLines:  buildDefaultProductLines(overrides),
  };
}
