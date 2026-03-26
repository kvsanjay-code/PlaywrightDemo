/**
 * Scratch tests — inspect ORDER and LODGE payload construction.
 * Run with --debug and set breakpoints freely.
 */

import { test, expect } from 'src/fixtures';
import { buildDefaultOrderPayload, buildDefaultAmendPayload, buildDefaultLodgePayload as buildHorticultureLodgePayload, PRODUCT_TYPE } from 'test-data/commodities/horticulture';
import { buildDefaultLodgePayload as buildGrainLodgePayload, buildDefaultOrderPayload as buildGrainOrderPayload } from 'test-data/commodities/grain';
import { buildDefaultLodgePayload as buildMeatLodgePayload,  buildDefaultOrderPayload as buildMeatOrderPayload }  from 'test-data/commodities/meat';
import { lodgeStep, readRexStep, futureDateISO } from 'src/helpers';
import { PrintIndicator } from 'src/interfaces';

test('debug — inspect full ORDER payload', async ({ soapClient }) => {
  const payload = buildDefaultOrderPayload({ destinationCountry: 'GB' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeOrderRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.orderRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect Horticulture LODGE payload', async ({ soapClient }) => {
  const payload = buildHorticultureLodgePayload({ destinationCountry: 'GB', printIndicator: PrintIndicator.Manual });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeLodgeRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.lodgeRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect Grain ORDER payload', async ({ soapClient }) => {
  const payload = buildGrainOrderPayload({ destinationCountry: 'CN' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeOrderRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.orderRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect Meat ORDER payload', async ({ soapClient }) => {
  const payload = buildMeatOrderPayload({ destinationCountry: 'JP' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeOrderRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.orderRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect Grain LODGE payload', async ({ soapClient }) => {
  const payload = buildGrainLodgePayload({ destinationCountry: 'CN' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeLodgeRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.lodgeRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect Meat LODGE payload', async ({ soapClient }) => {
  const payload = buildMeatLodgePayload({ destinationCountry: 'JP' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeLodgeRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.lodgeRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect full AMEND payload', async ({ soapClient }) => {
  // Step 1 — LODGE to get rexNumber + lastAmendmentTimestamp
  const lodgeState = await lodgeStep(soapClient, buildHorticultureLodgePayload({ destinationCountry: 'GB' }));

  console.log('Lodge state:\n', JSON.stringify(lodgeState, null, 2));

  // Step 2 — Build AMEND payload (amend product type to TUR)
  const payload = buildDefaultAmendPayload(lodgeState, {
    productType:     PRODUCT_TYPE.TUR,
    printIndicator:  PrintIndicator.Auto,
    amendmentReason: 'Debug — testing amend flow',
  });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const result = await soapClient.amendRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — LODGE then READ REX', async ({ soapClient }) => {
  // Step 1 — LODGE
  const lodgePayload = buildHorticultureLodgePayload({ destinationCountry: 'GB' });
  const lodgeState = await lodgeStep(soapClient, lodgePayload);

  console.log('LODGE state:\n', JSON.stringify(lodgeState, null, 2));

  // Step 2 — READ REX
  const readState = await readRexStep(soapClient, lodgeState.rexNumber);

  console.log('READ REX state:\n', JSON.stringify(readState, null, 2));
});

// ── BR-002 fault assertions ───────────────────────────────────────────────────

const DEPARTURE_BEYOND_28_DAYS = futureDateISO(35);

const faultCases = [
  { tc: 'TC-F01', country: 'SG' },
  { tc: 'TC-F02', country: 'HK' },
  { tc: 'TC-F03', country: 'MY' },
  { tc: 'TC-F04', country: 'MV' },
];

test.describe('BR-002-01 — fault 1115 when departure exceeds 28 days', () => {
  for (const { tc, country } of faultCases) {
    test(`${tc} — TUR → ${country}, departure +35 days → fault 1115`, async ({ soapClient }) => {
      const result = await soapClient.lodgeRex(
        buildHorticultureLodgePayload({ destinationCountry: country, productType: PRODUCT_TYPE.TUR, departureDate: DEPARTURE_BEYOND_28_DAYS }),
      );

      console.log(`${tc} result:\n`, JSON.stringify(result, null, 2));

      expect(result.success, `Expected LODGE to fail for TUR → ${country}`).toBe(false);

      if (!result.success) {
        const item1115 = result.faultItems.find(i => i.faultCode === '1115');
        expect(item1115, 'Expected NexdocSoapFaultItem with code 1115').toBeTruthy();
        expect(item1115!.faultMessage, 'Expected fault message about 28-day departure limit')
          .toContain('departure date cannot be more than 28 days');
      }
    });
  }
});
