/**
 * commodities/horticulture.ts
 *
 * Horticulture commodity defaults and pre-wired payload builders.
 * TODO: Replace placeholder codes with confirmed values from the service WSDL / test team.
 */

import { CommodityDefaults, BASE_DEFAULTS, createCommodityBuilders } from '../rex-defaults';

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

// ─── Builders ─────────────────────────────────────────────────────────────────

export const {
  buildOrderPayload,
  buildLodgePayload,
  buildDefaultOrderPayload,
  buildDefaultLodgePayload,
  buildDefaultAmendPayload,
} = createCommodityBuilders(DEFAULTS);
