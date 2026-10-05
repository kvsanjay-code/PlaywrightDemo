/**
 * grain-lodge-inspection.spec.ts
 *
 * LODGE (Grain) -> PEMS Grain and Plant Product inspection -> REX authorisation.
 *
 * Step 3 (REX authorisation) is a placeholder for now — approach to be discussed.
 */

import { test } from 'src/fixtures';
import { lodgeStep } from 'src/helpers';
import { buildDefaultLodgePayload } from 'test-data/commodities/grain';
import { grainInspection } from 'test-data/pems/grain-inspection';

test('TC-PEMS02 — LODGE -> PEMS Grain inspection -> REX authorisation', async ({
  soapClient,
  addGrainInspection,
}) => {
  // Step 1 — LODGE
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
  console.log('LODGE complete:', lodgeState);

  // Step 2 — Grain lodge: use the REX number to add the inspection details in PEMS
  const inspectionId = await addGrainInspection(lodgeState.rexNumber, grainInspection);
  console.log('PEMS Grain inspection complete:', inspectionId);

  // Step 3 — Approve REX authorisation
  // TODO: approach to be discussed
});
