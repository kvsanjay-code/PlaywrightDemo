/**
 * Scratch tests — inspect ORDER and LODGE payload construction.
 * No assertions. Run with --debug and set breakpoints freely.
 */

import { test } from 'src/fixtures';
import { buildDefaultOrderPayload } from './data/order.data';
import { buildDefaultLodgePayload } from './data/lodge.data';
import { buildDefaultAmendPayload } from './data/amend.data';
import { lodgeStep } from 'src/helpers';
import { PrintIndicator } from 'src/interfaces';
import { PRODUCT_TYPE } from './data/commodities/horticulture';

test('debug — inspect full ORDER payload', async ({ soapClient }) => {
  const payload = buildDefaultOrderPayload({ destinationCountry: 'GB' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeOrderRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.orderRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect full LODGE payload', async ({ soapClient }) => {
  const payload = buildDefaultLodgePayload({ destinationCountry: 'GB', printIndicator: PrintIndicator.Manual });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeLodgeRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.lodgeRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});

test('debug — inspect full AMEND payload', async ({ soapClient }) => {
  // Step 1 — LODGE to get rexNumber + lastAmendmentTimestamp
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload({ destinationCountry: 'GB' }));

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
