/**
 * Scratch tests — inspect ORDER and LODGE payload construction.
 * No assertions. Run with --debug and set breakpoints freely.
 */

import { test } from 'src/fixtures';
import { buildDefaultOrderPayload, buildDefaultAmendPayload, buildDefaultLodgePayload as buildHorticultureLodgePayload, PRODUCT_TYPE } from 'test-data/commodities/horticulture';
import { buildDefaultLodgePayload as buildGrainLodgePayload, buildDefaultOrderPayload as buildGrainOrderPayload } from 'test-data/commodities/grain';
import { buildDefaultLodgePayload as buildMeatLodgePayload,  buildDefaultOrderPayload as buildMeatOrderPayload }  from 'test-data/commodities/meat';
import { lodgeStep } from 'src/helpers';
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
