/**
 * horticulture.data.ts
 *
 * Shared payload builders for Horticulture commodity tests.
 * Only the minimum mandatory fields are populated here; each builder
 * accepts variable inputs so test cases can vary destination/product/date
 * without duplicating payload structure.
 *
 * TODO: Replace placeholder codes below with confirmed values from the service WSDL / test team.
 */

import { OrderRexPayload, LodgeRexPayload } from '../../src/interfaces';
import { randomExporterReference } from '../../src/helpers';

// ─── Commodity & product codes (confirm with service team) ───────────────────
// TODO: Confirm actual commodityType code for Horticulture
export const COMMODITY_TYPE = 'H';

// TODO: Confirm actual product type codes
export const PRODUCT_TYPE = {
  MANGO: 'MAN',
  TUR:   'TUR',
} as const;

// TODO: Confirm actual pack type and preservation type codes
const PACK_TYPE        = 'CTN';   // Carton
const PRESERVATION     = 'FRE';   // Fresh

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Returns an ISO date string (YYYY-MM-DD) for a date N days from today.
 * Use daysFromNow > 28 to trigger the departure date business rule.
 */
export function futureDateISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// ─── Default field values ─────────────────────────────────────────────────────

const DEFAULTS = {
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
  printIndicator:      'AUTO' as const,
  batchCode:           'BATCH-001',
  durabilityDaysStart: 1,
  durabilityDaysEnd:   30,
};

// ─── Payload builders ─────────────────────────────────────────────────────────

/**
 * Builds a minimal Horticulture ORDER payload.
 * exportDetails and productLines are mandatory for ORDER.
 */
export function buildHortOrderPayload(
  destinationCountry: string,
  productType: string,
  departureDate: string,
): OrderRexPayload {
  return {
    exportDetails: {
      commodityType:      COMMODITY_TYPE,
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
 * Builds a fully populated default Horticulture LODGE payload.
 * All fields use DEFAULTS — pass overrides to vary specific values per test.
 */
export function buildHortDefaultLodgePayload(overrides: {
  destinationCountry?: string;
  productType?:        string;
  departureDate?:      string;
  printIndicator?:     'AUTO' | 'MANUAL' | 'NONE';
} = {}): LodgeRexPayload {
  const destinationCountry = overrides.destinationCountry ?? DEFAULTS.destinationCountry;
  const productType        = overrides.productType        ?? DEFAULTS.productType;
  const departureDate      = overrides.departureDate      ?? futureDateISO(DEFAULTS.departureDaysFromNow);
  const printIndicator     = overrides.printIndicator     ?? DEFAULTS.printIndicator;

  return {
    payloadType: 'LODGE',

    exportDetails: {
      commodityType: COMMODITY_TYPE,
      destinationCountry,
      departureDate,
      exporterReference: randomExporterReference('HORT'),

      consigneeDetails: {
        consigneeName:        DEFAULTS.consigneeName,
        consigneeAddress:     DEFAULTS.consigneeAddress,
        consigneePhoneNumber: DEFAULTS.consigneePhone,
      },

      transportDetails: {
        transportMode:        DEFAULTS.transportMode,
        voyageOrFlightNumber: DEFAULTS.voyageNumber,
        vesselName:           DEFAULTS.vesselName,
        shippingCompany:      DEFAULTS.shippingCompany,
      },

      loadingPorts:   { loadingPort:   [DEFAULTS.loadingPort] },
      dischargePorts: { dischargePort: [DEFAULTS.dischargePort] },

      importedProductFlag:                            'N',
      manufacturedTreatedPackagedLabelledInAustralia: 'Y',
    },

    certificateDetails: {
      certificatePrintControls: {
        certificatePrintIndicator: printIndicator,
      },
    },

    productLines: {
      productLine: [
        {
          lineNumber: '1',
          productDetails: {
            productType,
            packType:         PACK_TYPE,
            preservationType: PRESERVATION,
            netMetricWeight:  { value: DEFAULTS.netWeightKg, unit: 'KG' },
            outerProductPackaging: {
              quantity: { value: DEFAULTS.outerPackQty, packageType: PACK_TYPE },
            },
          },
          batchCode:           DEFAULTS.batchCode,
          durabilityStartDate: futureDateISO(DEFAULTS.durabilityDaysStart),
          durabilityEndDate:   futureDateISO(DEFAULTS.durabilityDaysEnd),
        },
      ],
    },
  };
}

/**
 * Builds a minimal Horticulture LODGE payload.
 */
export function buildHortLodgePayload(
  destinationCountry: string,
  productType: string,
  departureDate: string,
): LodgeRexPayload {
  return {
    payloadType: 'LODGE',
    exportDetails: {
      commodityType:      COMMODITY_TYPE,
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
