/**
 * Scratch tests — inspect ORDER and LODGE payload construction.
 * Run with --debug and set breakpoints freely.
 */

import { test, expect } from 'src/fixtures';
import { buildDefaultOrderPayload, buildDefaultAmendPayload, buildDefaultLodgePayload as buildHorticultureLodgePayload, PRODUCT_TYPE } from 'test-data/commodities/horticulture';
import { buildDefaultLodgePayload as buildGrainLodgePayload, buildDefaultOrderPayload as buildGrainOrderPayload } from 'test-data/commodities/grain';
import { buildDefaultLodgePayload as buildMeatLodgePayload, buildDefaultOrderPayload as buildMeatOrderPayload } from 'test-data/commodities/meat';
import { buildDefaultOrderPayload as buildDairyOrderPayload, buildDefaultLodgePayload as buildDairyLodgePayload } from 'test-data/commodities/dairy';
import { buildDefaultEuTransit, buildDefaultEuPlaceOfDestinationDetail } from 'test-data/rex-defaults';
import { lodgeStep, readRexStep, releaseRexToPrintStep, futureDateISO } from 'src/helpers';
import { PrintIndicator } from 'src/interfaces';
import format from 'xml-formatter';



// ── Dairy ─────────────────────────────────────────────────────────────────────

test('debug — inspect Dairy ORDER payload', async ({ soapClient }) => {
  const payload = buildDairyOrderPayload({ destinationCountry: 'CN' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeOrderRex(payload);
  console.log('Serialized XML:\n', xml);

  const result = await soapClient.orderRex(payload);
  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect Dairy LODGE payload', async ({ soapClient }) => {
  const payload = buildDairyLodgePayload({ destinationCountry: 'CN' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeLodgeRex(payload);
  console.log(format(xml, { collapseContent: true }));

  const result = await soapClient.lodgeRex(payload);
  console.log('Result:\n', JSON.stringify(result, null, 2));
});

// ── Horticulture ───────────────────────────────────────────────────────

test('debug — inspect Horticulture LODGE payload', async ({ soapClient }) => {
  const payload = buildHorticultureLodgePayload({ destinationCountry: 'CN' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeLodgeRex(payload);
  console.log(format(xml, { collapseContent: true }));

  const result = await soapClient.lodgeRex(payload);
  console.log('Result:\n', JSON.stringify(result, null, 2));
});