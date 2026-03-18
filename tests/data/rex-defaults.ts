/**
 * rex-defaults.ts
 *
 * Shared commodity codes, default field values, and section builders
 * reused across ORDER, LODGE, and AMEND payload builders.
 *
 * TODO: Replace placeholder codes with confirmed values from the service WSDL / test team.
 */

import { ExportDetails, ProductLines, PrintIndicator } from '../../src/interfaces';
import { randomExporterReference, futureDateISO } from '../../src/helpers';
import { PayloadOverrides, o } from './payload-overrides';

// ─── Commodity & product codes ────────────────────────────────────────────────

export const COMMODITY_TYPE = 'H';   // TODO: confirm

export const PRODUCT_TYPE = {
  MANGO: 'MAN',
  TUR:   'TUR',
} as const;

export const PACK_TYPE    = 'CTN';   // Carton
export const PRESERVATION = 'FRE';   // Fresh

// ─── Default field values ─────────────────────────────────────────────────────

export const DEFAULTS = {
  destinationCountry:   'SG',
  productType:          PRODUCT_TYPE.MANGO,
  departureDaysFromNow: 5,
  consigneeName:        'ABC Importer Pte Ltd',
  consigneeAddress: {
    streetLine: '123 Import Road',
    city:       'Singapore',
    country:    'SG',
    postalCode: '123456',
  },
  consigneePhone:      '+6512345678',
  transportMode:       'SEA',
  voyageNumber:        'V001',
  vesselName:          'MV Example',
  shippingCompany:     'Example Shipping Co',
  loadingPort:         'AUMEL',
  dischargePort:       'SGSIN',
  netWeightKg:         '500',
  outerPackQty:        '10',
  printIndicator:      PrintIndicator.Auto,
  batchCode:           'BATCH-001',
  durabilityDaysStart: 1,
  durabilityDaysEnd:   30,
};

// ─── Shared section builders ──────────────────────────────────────────────────

export function buildDefaultExportDetails(overrides: PayloadOverrides): ExportDetails {
  const destinationCountry = o(DEFAULTS.destinationCountry, overrides.destinationCountry)!;

  return {
    commodityType:      COMMODITY_TYPE,
    destinationCountry,
    departureDate:      o(futureDateISO(DEFAULTS.departureDaysFromNow), overrides.departureDate),
    exporterReference:  o(randomExporterReference('REX'),               overrides.exporterReference),

    consigneeDetails: {
      consigneeName:        o(DEFAULTS.consigneeName,  overrides.consigneeName),
      consigneeAddress:     DEFAULTS.consigneeAddress,
      consigneePhoneNumber: o(DEFAULTS.consigneePhone, overrides.consigneePhone),
    },

    transportDetails: {
      transportMode:        o(DEFAULTS.transportMode,   overrides.transportMode),
      voyageOrFlightNumber: o(DEFAULTS.voyageNumber,    overrides.voyageNumber),
      vesselName:           o(DEFAULTS.vesselName,      overrides.vesselName),
      shippingCompany:      o(DEFAULTS.shippingCompany, overrides.shippingCompany),
    },

    loadingPorts:   { loadingPort:   [o(DEFAULTS.loadingPort,   overrides.loadingPort)!] },
    dischargePorts: { dischargePort: [o(DEFAULTS.dischargePort, overrides.dischargePort)!] },

    importedProductFlag:                            'N',
    manufacturedTreatedPackagedLabelledInAustralia: 'Y',
  };
}

export function buildDefaultProductLines(overrides: PayloadOverrides): ProductLines {
  const productType = o(DEFAULTS.productType, overrides.productType)!;
  const packType    = o(PACK_TYPE,            overrides.packType)!;

  return {
    productLine: [
      {
        lineNumber: '1',
        productDetails: {
          productType,
          packType,
          preservationType: o(PRESERVATION,          overrides.preservationType)!,
          netMetricWeight:  { value: o(DEFAULTS.netWeightKg, overrides.netWeightKg)!, unit: 'KG' },
          outerProductPackaging: {
            quantity: { value: o(DEFAULTS.outerPackQty, overrides.outerPackQty)!,  packageType: packType },
          },
        },
        batchCode:           o(DEFAULTS.batchCode,                          overrides.batchCode),
        durabilityStartDate: o(futureDateISO(DEFAULTS.durabilityDaysStart), overrides.durabilityStartDate),
        durabilityEndDate:   o(futureDateISO(DEFAULTS.durabilityDaysEnd),   overrides.durabilityEndDate),
      },
    ],
  };
}
