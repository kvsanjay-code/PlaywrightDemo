/**
 * rex-defaults.ts
 *
 * Generic infrastructure for all commodity payload builders.
 * Defines CommodityDefaults interface, shared base defaults, and section builders
 * that accept a CommodityDefaults so each commodity can supply its own values.
 */

import { ExportDetails, ProductLines, PrintIndicator } from '../../src/interfaces';
import { randomExporterReference, futureDateISO } from '../../src/helpers';
import { PayloadOverrides, o } from './payload-overrides';

// ─── Transport modes ──────────────────────────────────────────────────────────

export const TRANSPORT_MODE = {
  SEA: 'SEA',
  AIR: 'AIR',
} as const;

// ─── CommodityDefaults interface ──────────────────────────────────────────────

export interface CommodityDefaults {
  commodityType:        string;
  defaultProductType:   string;
  packType:             string;
  preservationType:     string;
  destinationCountry:   string;
  departureDaysFromNow: number;
  consigneeName:        string;
  consigneeAddress: {
    streetLine: string;
    city:       string;
    country:    string;
    postalCode: string;
  };
  consigneePhone:      string;
  transportMode:       string;
  voyageNumber:        string;
  vesselName:          string;
  shippingCompany:     string;
  loadingPort:         string;
  dischargePort:       string;
  netWeightKg:         string;
  outerPackQty:        string;
  printIndicator:      PrintIndicator;
  batchCode:           string;
  durabilityDaysStart: number;
  durabilityDaysEnd:   number;
  containerNumber:     string;
  exporterPrefix:      string;
}

// ─── Shared base defaults (overridden per commodity) ─────────────────────────

export const BASE_DEFAULTS: Omit<CommodityDefaults, 'commodityType' | 'defaultProductType' | 'packType' | 'preservationType' | 'exporterPrefix'> = {
  destinationCountry:   'SG',
  departureDaysFromNow: 5,
  consigneeName:        'ABC Importer Pte Ltd',
  consigneeAddress: {
    streetLine: '123 Import Road',
    city:       'Singapore',
    country:    'SG',
    postalCode: '123456',
  },
  consigneePhone:      '+6512345678',
  transportMode:       TRANSPORT_MODE.SEA,
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
  containerNumber:     'CONT-001',
};

// ─── Generic section builders ─────────────────────────────────────────────────

export function buildDefaultExportDetails(d: CommodityDefaults, overrides: PayloadOverrides): ExportDetails {
  const destinationCountry = o(d.destinationCountry, overrides.destinationCountry)!;

  return {
    commodityType:      d.commodityType,
    destinationCountry,
    departureDate:      o(futureDateISO(d.departureDaysFromNow), overrides.departureDate),
    exporterReference:  o(randomExporterReference(d.exporterPrefix), overrides.exporterReference),

    consigneeDetails: {
      consigneeName:        o(d.consigneeName,  overrides.consigneeName),
      consigneeAddress:     d.consigneeAddress,
      consigneePhoneNumber: o(d.consigneePhone, overrides.consigneePhone),
    },

    transportDetails: {
      transportMode:        o(d.transportMode,   overrides.transportMode),
      voyageOrFlightNumber: o(d.voyageNumber,    overrides.voyageNumber),
      vesselName:           o(d.vesselName,      overrides.vesselName),
      shippingCompany:      o(d.shippingCompany, overrides.shippingCompany),
    },

    loadingPorts:   { loadingPort:   [o(d.loadingPort,   overrides.loadingPort)!] },
    dischargePorts: { dischargePort: [o(d.dischargePort, overrides.dischargePort)!] },

    importedProductFlag:                            'N',
    manufacturedTreatedPackagedLabelledInAustralia: 'Y',
  };
}

export function buildDefaultProductLines(d: CommodityDefaults, overrides: PayloadOverrides, transportMode: string): ProductLines {
  const productType = o(d.defaultProductType, overrides.productType)!;
  const packType    = o(d.packType,           overrides.packType)!;

  // Containers are mandatory for SEA, not required for AIR
  const containers = transportMode === TRANSPORT_MODE.SEA
    ? { container: [{ containerNumber: o(d.containerNumber, overrides.containerNumber)! }] }
    : undefined;

  return {
    productLine: [
      {
        lineNumber: '1',
        productDetails: {
          productType,
          packType,
          preservationType: o(d.preservationType,  overrides.preservationType)!,
          netMetricWeight:  { value: o(d.netWeightKg, overrides.netWeightKg)!, unit: 'KG' },
          outerProductPackaging: {
            quantity: { value: o(d.outerPackQty, overrides.outerPackQty)!, packageType: packType },
          },
        },
        containers,
        batchCode:           o(d.batchCode,                          overrides.batchCode),
        durabilityStartDate: o(futureDateISO(d.durabilityDaysStart), overrides.durabilityStartDate),
        durabilityEndDate:   o(futureDateISO(d.durabilityDaysEnd),   overrides.durabilityEndDate),
      },
    ],
  };
}
