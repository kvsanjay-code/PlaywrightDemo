/**
 * custom-certificate-defaults.ts
 *
 * Default values and builder for LodgeCustomCertificatePayload.
 *
 * Usage:
 *   buildDefaultLodgeCustomCertificatePayload(rexNumber)
 *   buildDefaultLodgeCustomCertificatePayload(rexNumber, { destinationCountry: 'JP' })
 *   buildDefaultLodgeCustomCertificatePayload(rexNumber, { consigneeName: null })  // omit field
 */

import {
  LodgeCustomCertificatePayload,
  CustomCertificateImportPermit,
  CustomCertificateContainer,
  PrintIndicator,
} from 'src/interfaces';
import { futureDateISO, randomExporterReference } from 'src/helpers';
import { config } from 'src/config/environment';
import { Nullable, o } from './payload-overrides';

// ─── Static defaults ──────────────────────────────────────────────────────────

export const DEFAULTS = {
  // Consignee
  consigneeName:             'ABC Importer Pte Ltd',
  consigneeAddress: {
    streetLine: '123 Import Road',
    city:       'Singapore',
    country:    'SG',
    postalCode: '123456',
  },

  // Transport
  departureDaysFromNow: 5,
  dischargePort:        'SGSIN',
  destinationCity:      'Singapore',
  destinationCountry:   'SG',
  vesselName:           'MV Example',
  voyageOrFlightNumber: 'V001',

  // Certificate print
  certificatePrintIndicator: PrintIndicator.Custom as string,

  // Product line
  netQuantityValue:    '500',
  netQuantityUnit:     'KG',
  outerPackageQty:     '10',
  outerPackageType:    'CTN',
  rexProductLineNumber: '1',
  certificateLineNumber: '1',

  // Declaration
  exporterDeclarationCode: 'DEC001',
} as const;

// ─── Overrides interface ──────────────────────────────────────────────────────

export interface CustomCertificateOverrides {
  // Consignee
  consigneeName?:              Nullable<string>;
  consigneeAddress?:           Nullable<{ streetLine?: string; city: string; country: string; state?: string; postalCode?: string }>;
  consigneeReferenceNumber?:   Nullable<string>;

  // Transport
  departureDate?:              Nullable<string>;
  dischargePort?:              Nullable<string>;
  destinationCity?:            Nullable<string>;
  destinationCountry?:         Nullable<string>;
  voyageOrFlightNumber?:       Nullable<string>;
  vesselName?:                 Nullable<string>;

  // Additional details
  exporterReference?:          Nullable<string>;
  certificatePrintIndicator?:  Nullable<string>;
  certificatePrintRegion?:     Nullable<string>;
  certificateRequiredClientGroup?: Nullable<string>;
  importPermits?:              CustomCertificateImportPermit[];

  // Product line (applies to line 1; for multiple lines use additionalProductLines)
  netQuantityValue?:           Nullable<string>;
  netQuantityUnit?:            Nullable<string>;
  outerPackageQty?:            Nullable<string>;
  outerPackageType?:           Nullable<string>;
  rexProductLineNumber?:       Nullable<string>;
  certificateLineNumber?:      Nullable<string>;
  containers?:                 CustomCertificateContainer[];

  // Declaration
  exporterDeclarationCode?:    Nullable<string>;
}

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Builds a LodgeCustomCertificatePayload using shared defaults.
 *
 * @param rexNumber  The rexNumber returned from the preceding LODGE step — always required.
 * @param overrides  Optional field overrides. Pass null to omit a field; a value to replace the default.
 */
export function buildDefaultLodgeCustomCertificatePayload(
  rexNumber: string,
  overrides: CustomCertificateOverrides = {},
): LodgeCustomCertificatePayload {
  const D = DEFAULTS;

  // Resolve print details — region and clientGroup are mutually exclusive (CHOICE)
  const printRegion      = o(undefined as string | undefined, overrides.certificatePrintRegion);
  const printClientGroup = printRegion === undefined
    ? o(config.certificateRequiredClientGroup, overrides.certificateRequiredClientGroup)
    : undefined;

  return {
    consigneeDetails: {
      consigneeName:           o(D.consigneeName,    overrides.consigneeName)!,
      consigneeAddress:        o(D.consigneeAddress as { streetLine?: string; city: string; country: string; postalCode?: string }, overrides.consigneeAddress)!,
      consigneeReferenceNumber: o(undefined as string | undefined, overrides.consigneeReferenceNumber),
    },

    transportDetails: {
      departureDate:         o(futureDateISO(D.departureDaysFromNow), overrides.departureDate)!,
      dischargePort:         o(D.dischargePort,        overrides.dischargePort)!,
      destinationCity:       o(D.destinationCity,      overrides.destinationCity)!,
      destinationCountry:    o(D.destinationCountry,   overrides.destinationCountry)!,
      vesselName:            o(D.vesselName,            overrides.vesselName),
      voyageOrFlightNumber:  o(D.voyageOrFlightNumber, overrides.voyageOrFlightNumber),
    },

    additionalDetails: {
      exporterReference: o(randomExporterReference('CUST'), overrides.exporterReference)!,
      certificatePrintDetails: {
        certificatePrintIndicator:      o(D.certificatePrintIndicator, overrides.certificatePrintIndicator)!,
        certificatePrintRegion:         printRegion,
        certificateRequiredClientGroup: printClientGroup,
      },
      importPermits: overrides.importPermits,
    },

    productLines: [
      {
        requestLineNumber:    '1',
        rexNumber,
        rexProductLineNumber: o(D.rexProductLineNumber, overrides.rexProductLineNumber)!,
        certificateLineNumber: o(D.certificateLineNumber, overrides.certificateLineNumber)!,
        productDetails: {
          netQuantity:          { value: o(D.netQuantityValue, overrides.netQuantityValue)!, unit: o(D.netQuantityUnit, overrides.netQuantityUnit)! },
          outerPackageQuantity: { value: o(D.outerPackageQty,  overrides.outerPackageQty)!,  packageType: o(D.outerPackageType, overrides.outerPackageType)! },
        },
        containers: overrides.containers,
      },
    ],

    exporterDeclarationCode: o(D.exporterDeclarationCode, overrides.exporterDeclarationCode)!,
  };
}
