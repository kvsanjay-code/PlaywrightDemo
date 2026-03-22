/**
 * BR-002-01 — Departure Date Limit by Destination Country
 *
 * Rule:  When destination is SG, HK, MY, or MV, departure date cannot be
 *        more than 28 days from the lodgement date.
 * Exception: Product type Mango is exempt — departure can exceed 28 days.
 *
 * Test flow (per test):
 *   LODGE → assert accepted / rejected
 *
 * TC01–TC04: Mango → {SG, HK, MY, MV}, departure +35 days → Accepted (exempt)
 * TC05–TC08: TUR   → {SG, HK, MY, MV}, departure +35 days → Rejected
 */

import { test, expect } from 'src/fixtures';
import { SoapResult }   from 'src/soap';
import { buildLodgePayload, PRODUCT_TYPE } from 'test-data/commodities/horticulture';
import { futureDateISO }     from 'src/helpers';

// Departure date well beyond the 28-day threshold
const DEPARTURE_DATE = futureDateISO(35);

// ─── TC01–TC04: Mango is exempt — LODGE should be accepted ───────────────────

const mangoExemptCases = [
  { tc: 'TC01', country: 'SG' },
  { tc: 'TC02', country: 'HK' },
  { tc: 'TC03', country: 'MY' },
  { tc: 'TC04', country: 'MV' },
];

test.describe('BR-002-01 — Mango exempt from 28-day departure limit', () => {
  for (const { tc, country } of mangoExemptCases) {
    test(`${tc} — Mango → ${country}, departure +35 days → accepted`, async ({ soapClient }) => {
      const lodgeResult = await soapClient.lodgeRex(
        buildLodgePayload(country, PRODUCT_TYPE.MANGO, DEPARTURE_DATE),
      );

      expect(lodgeResult.success, `LODGE failed for Mango → ${country}: ${formatFault(lodgeResult)}`).toBe(true);

      if (lodgeResult.success) {
        expect(lodgeResult.rexNumber,              'LODGE response missing rexNumber').toBeTruthy();
        expect(lodgeResult.lastAmendmentTimestamp, 'LODGE response missing lastAmendmentTimestamp').toBeTruthy();
      }
    });
  }
});

// ─── TC05–TC08: TUR exceeds 28-day limit — LODGE should be rejected ──────────

const turRejectedCases = [
  { tc: 'TC05', country: 'SG' },
  { tc: 'TC06', country: 'HK' },
  { tc: 'TC07', country: 'MY' },
  { tc: 'TC08', country: 'MV' },
];

test.describe('BR-002-01 — TUR rejected when departure exceeds 28-day limit', () => {
  for (const { tc, country } of turRejectedCases) {
    test(`${tc} — TUR → ${country}, departure +35 days → rejected (fault 1115)`, async ({ soapClient }) => {
      const lodgeResult = await soapClient.lodgeRex(
        buildLodgePayload(country, PRODUCT_TYPE.TUR, DEPARTURE_DATE),
      );

      expect(lodgeResult.success, `Expected LODGE to fail for TUR → ${country} but it succeeded`).toBe(false);

      if (!lodgeResult.success) {
        expect(lodgeResult.faultCode, `Expected fault code 1115 for TUR → ${country}`).toBe('1115');
      }
    });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFault(result: SoapResult): string {
  if (result.success) return '';
  return `[${result.faultCode}] ${result.faultString}`;
}
