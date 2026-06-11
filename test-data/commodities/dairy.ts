/**
 * commodities/dairy.ts
 *
 * Dairy commodity defaults and pre-wired payload builders.
 * TODO: Replace placeholder codes with confirmed values from the service WSDL / test team.
 */

import { CommodityDefaults, BASE_DEFAULTS, createCommodityBuilders } from '../rex-defaults';

// ─── Commodity codes ──────────────────────────────────────────────────────────

export const COMMODITY_TYPE = 'D';

export const PRODUCT_TYPE = {
  CASEIN: 'CAS',   // TODO: confirm

} as const;

// ─── Commodity defaults ───────────────────────────────────────────────────────

export const DEFAULTS: CommodityDefaults = {
  ...BASE_DEFAULTS,
  commodityType: COMMODITY_TYPE,
  defaultProductType: PRODUCT_TYPE.CASEIN,
  packType: 'CTN',   // Carton — TODO: confirm
  preservationType: 'CHI',   // Chilled — TODO: confirm
  exporterPrefix: 'DAIRY',
  destinationCountry: 'CN',    // Common dairy export destination
};

// ─── Builders ─────────────────────────────────────────────────────────────────

export const {
  buildDefaultOrderPayload,
  buildDefaultLodgePayload,
  buildDefaultAmendPayload,
  buildDefaultReplacePayload,
} = createCommodityBuilders(DEFAULTS);
