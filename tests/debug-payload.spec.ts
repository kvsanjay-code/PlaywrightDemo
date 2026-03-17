/**
 * Scratch test — inspect LODGE payload construction.
 * No assertions. Run with --debug and set breakpoints freely.
 */

import { test } from '../src/fixtures';
import { buildHortDefaultLodgePayload } from './data/horticulture.data';

test('debug — inspect full LODGE payload', async ({ soapClient }) => {
  const payload = buildHortDefaultLodgePayload({ destinationCountry: 'GB', printIndicator: 'MANUAL' });

  console.log('Payload object:\n', JSON.stringify(payload, null, 2));

  const xml = soapClient.serializeLodgeRex(payload);

  console.log('Serialized XML:\n', xml);

  const result = await soapClient.lodgeRex(payload);

  console.log('Result:\n', JSON.stringify(result, null, 2));
});
