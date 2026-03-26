/**
 * payload-overrides.ts
 *
 * Generic override utilities for payload builders.
 *
 * Override pattern:
 *   - Omit a key  → use default value
 *   - Pass a value → use that value
 *   - Pass null    → explicitly omit the field from the payload (e.g. no departureDate)
 */

import { PrintIndicator, ProductLine } from 'src/interfaces';

/**
 * Wraps a type to also allow null, which signals "omit this field from the payload".
 */
export type Nullable<T> = T | null;

/**
 * Generic overrides interface for REX payload builders.
 * null = explicitly omit the field. undefined/omitted = use default.
 */
export interface PayloadOverrides {
  // Export details
  destinationCountry?: Nullable<string>;
  departureDate?:      Nullable<string>;
  exporterReference?:  Nullable<string>;
  consigneeName?:      Nullable<string>;
  consigneePhone?:     Nullable<string>;
  transportMode?:      Nullable<'S'|'A'>;
  voyageNumber?:       Nullable<string>;
  vesselName?:         Nullable<string>;
  shippingCompany?:    Nullable<string>;
  loadingPort?:        Nullable<string>;
  dischargePort?:      Nullable<string>;
  // Product line
  productType?:        Nullable<string>;
  packType?:           Nullable<string>;
  preservationType?:   Nullable<string>;
  netWeightKg?:        Nullable<string>;
  outerPackQty?:       Nullable<string>;
  batchCode?:          Nullable<string>;
  durabilityStartDate?: Nullable<string>;
  durabilityEndDate?:   Nullable<string>;
  containerNumber?:    Nullable<string>;
  // Certificate
  printIndicator?:     Nullable<PrintIndicator>;
  // Additional product lines (appended after the default line 1)
  additionalProductLines?: ProductLine[];
}

/**
 * Resolves the final value for a field:
 *   null      → undefined (field omitted from payload)
 *   undefined → defaultVal (use default)
 *   value     → value (use override)
 */
export function o<T>(defaultVal: T, override: Nullable<T> | undefined): T | undefined {
  if (override === null) return undefined;
  return override ?? defaultVal;
}
