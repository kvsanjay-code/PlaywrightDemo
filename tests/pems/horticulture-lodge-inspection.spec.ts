/**
 * horticulture-lodge-inspection.spec.ts
 *
 * LODGE (Horticulture) -> PEMS Horticulture inspection -> REX authorisation.
 *
 * Step 3 (REX authorisation) is a placeholder for now — approach to be discussed.
 */

import { test } from 'src/fixtures';
import { lodgeStep } from 'src/helpers';
import { buildDefaultLodgePayload } from 'test-data/commodities/horticulture';
import { horticultureInspection } from 'test-data/pems/horticulture-inspection';

test('TC-PEMS01 — LODGE -> PEMS Horticulture inspection -> REX authorisation', async ({
  soapClient,
  addHorticultureInspection,
}) => {
  // Step 1 — LODGE
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
  console.log('LODGE complete:', lodgeState);

  // Step 2 — Horticulture lodge: use the REX number to add the inspection details in PEMS
  const inspectionId = await addHorticultureInspection(lodgeState.rexNumber, horticultureInspection);
  console.log('PEMS Horticulture inspection complete:', inspectionId);

  // Step 3 — Approve REX authorisation
  // TODO: approach to be discussed
});
