/**
 * commodities/meat.ts
 *
 * Meat commodity defaults and pre-wired payload builders.
 * TODO: Replace placeholder codes with confirmed values from the service WSDL / test team.
 */

import { CommodityDefaults, BASE_DEFAULTS, createCommodityBuilders } from '../rex-defaults';

// ─── Commodity codes ──────────────────────────────────────────────────────────

export const COMMODITY_TYPE = 'MT';   // TODO: confirm

export const PRODUCT_TYPE = {
  BEEF:   'BEEF',   // TODO: confirm
  LAMB:   'LAMB',   // TODO: confirm
  PORK:   'PORK',   // TODO: confirm
  OFFAL:  'OFFL',   // TODO: confirm
} as const;

// ─── Commodity defaults ───────────────────────────────────────────────────────

export const DEFAULTS: CommodityDefaults = {
  ...BASE_DEFAULTS,
  commodityType:      COMMODITY_TYPE,
  defaultProductType: PRODUCT_TYPE.BEEF,
  packType:           'CTN',   // Carton — TODO: confirm
  preservationType:   'CHI',   // Chilled — TODO: confirm
  exporterPrefix:     'MEAT',
  destinationCountry: 'JP',    // Common meat export destination
};

// ─── Builders ─────────────────────────────────────────────────────────────────

export const {
  buildOrderPayload,
  buildLodgePayload,
  buildDefaultOrderPayload,
  buildDefaultLodgePayload,
  buildDefaultAmendPayload,
} = createCommodityBuilders(DEFAULTS);
