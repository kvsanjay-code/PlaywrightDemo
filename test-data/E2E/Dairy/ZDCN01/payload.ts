/**
 * payload.ts
 *
 * Payload overrides for the ZDCN01 (Dairy, China) certificate lifecycle E2E test.
 */

import { PayloadOverrides } from '../../../payload-overrides';

export const ZDCN01_PAYLOAD_OVERRIDES: PayloadOverrides = {
  destinationCountry: 'CN',
  productType:        'INF',
  packType:            'PK',
};
