/**
 * commodities/horticulture.ts
 *
 * Horticulture commodity defaults and pre-wired payload builders.
 * TODO: Replace placeholder codes with confirmed values from the service WSDL / test team.
 */

import { LodgeRexPayload, OrderRexPayload, AmendRexPayload, PrintIndicator } from '../../../src/interfaces';
import { RexState, toIdentification } from '../../../src/helpers';
import { PayloadOverrides, o } from '../payload-overrides';
import { CommodityDefaults, BASE_DEFAULTS, TRANSPORT_MODE, buildDefaultExportDetails, buildDefaultProductLines } from '../rex-defaults';

// ─── Commodity codes ──────────────────────────────────────────────────────────

export const COMMODITY_TYPE = 'H';   // TODO: confirm

export const PRODUCT_TYPE = {
  MANGO: 'MAN',
  TUR:   'TUR',
} as const;

// ─── Commodity defaults ───────────────────────────────────────────────────────

export const DEFAULTS: CommodityDefaults = {
  ...BASE_DEFAULTS,
  commodityType:      COMMODITY_TYPE,
  defaultProductType: PRODUCT_TYPE.MANGO,
  packType:           'CTN',   // Carton
  preservationType:   'FRE',   // Fresh
  exporterPrefix:     'HORT',
};

// ─── Minimal builders ─────────────────────────────────────────────────────────

export function buildOrderPayload(destinationCountry: string, productType: string, departureDate: string): OrderRexPayload {
  return {
    exportDetails: { commodityType: COMMODITY_TYPE, destinationCountry, departureDate },
    productLines: {
      productLine: [{ lineNumber: '1', productDetails: { productType, packType: DEFAULTS.packType, preservationType: DEFAULTS.preservationType } }],
    },
  };
}

export function buildLodgePayload(destinationCountry: string, productType: string, departureDate: string): LodgeRexPayload {
  return {
    payloadType: 'LODGE',
    exportDetails: { commodityType: COMMODITY_TYPE, destinationCountry, departureDate },
    productLines: {
      productLine: [{ lineNumber: '1', productDetails: { productType, packType: DEFAULTS.packType, preservationType: DEFAULTS.preservationType } }],
    },
  };
}

// ─── Default builders ─────────────────────────────────────────────────────────

export function buildDefaultOrderPayload(overrides: PayloadOverrides = {}): OrderRexPayload {
  const transportMode = o(DEFAULTS.transportMode, overrides.transportMode)!;
  return {
    exportDetails: buildDefaultExportDetails(DEFAULTS, overrides),
    productLines:  buildDefaultProductLines(DEFAULTS, overrides, transportMode),
  };
}

export function buildDefaultLodgePayload(overrides: PayloadOverrides = {}): LodgeRexPayload {
  const transportMode  = o(DEFAULTS.transportMode,  overrides.transportMode)!;
  const printIndicator = o(DEFAULTS.printIndicator, overrides.printIndicator);
  return {
    payloadType:    'LODGE',
    exportDetails:  buildDefaultExportDetails(DEFAULTS, overrides),
    certificateDetails: {
      certificatePrintControls: { certificatePrintIndicator: printIndicator },
    },
    productLines:   buildDefaultProductLines(DEFAULTS, overrides, transportMode),
  };
}

export function buildDefaultAmendPayload(
  rexState: RexState,
  overrides: PayloadOverrides & { amendmentReason?: string | null; submitAmendmentRequest?: string | null } = {},
): AmendRexPayload {
  const transportMode  = o(DEFAULTS.transportMode,  overrides.transportMode)!;
  const printIndicator = o(DEFAULTS.printIndicator, overrides.printIndicator);
  return {
    identification:     toIdentification(rexState),
    exportDetails:      buildDefaultExportDetails(DEFAULTS, overrides),
    certificateDetails: {
      certificatePrintControls: { certificatePrintIndicator: printIndicator },
    },
    productLines:       buildDefaultProductLines(DEFAULTS, overrides, transportMode),
    amendmentReason:    o(undefined, overrides.amendmentReason)        ?? undefined,
    submitAmendmentRequest: o(undefined, overrides.submitAmendmentRequest) ?? undefined,
  };
}
