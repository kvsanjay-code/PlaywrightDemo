/**
 * commodities/grain.ts
 *
 * Grain commodity defaults and pre-wired payload builders.
 * TODO: Replace placeholder codes with confirmed values from the service WSDL / test team.
 */

import { CommodityDefaults, BASE_DEFAULTS, createCommodityBuilders } from '../rex-defaults';

// ─── Commodity codes ──────────────────────────────────────────────────────────

export const COMMODITY_TYPE = 'GR';   // TODO: confirm

export const PRODUCT_TYPE = {
  WHEAT:  'WHT',   // TODO: confirm
  BARLEY: 'BAR',   // TODO: confirm
  CANOLA: 'CAN',   // TODO: confirm
} as const;

// ─── Commodity defaults ───────────────────────────────────────────────────────

export const DEFAULTS: CommodityDefaults = {
  ...BASE_DEFAULTS, 
  commodityType:      COMMODITY_TYPE,
  defaultProductType: PRODUCT_TYPE.WHEAT,
  packType:           'BLK',   // Bulk — TODO: confirm
  preservationType:   'DRY',   // Dry — TODO: confirm
  exporterPrefix:     'GRAIN',
  destinationCountry: 'CN',    // Common grain export destination
};

// ─── Builders ─────────────────────────────────────────────────────────────────

export const {
  buildDefaultOrderPayload,
  buildDefaultLodgePayload,
  buildDefaultAmendPayload,
  buildDefaultReplacePayload,
} = createCommodityBuilders(DEFAULTS);
