/**
 * grain-lodge-inspection.spec.ts
 *
 * LODGE (Grain) -> PEMS Grain and Plant Product inspection -> REX authorisation -> logout.
 */

import { test } from 'src/fixtures';
import { lodgeStep } from 'src/helpers';
import { buildDefaultLodgePayload } from 'test-data/commodities/grain';
import { grainInspection } from 'test-data/pems/grain-inspection';

test('TC-PEMS02 — LODGE -> PEMS Grain inspection -> REX authorisation', async ({
  soapClient,
  addGrainInspection,
}) => {
  test.setTimeout(5 * 60_000);

  // Step 1 — LODGE
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
  console.log('LODGE complete:', lodgeState);

  // Step 2 — Grain lodge: use the REX number to add the inspection details in PEMS,
  // then request REX authorisation and log out
  const inspectionId = await addGrainInspection(lodgeState.rexNumber, grainInspection);
  console.log('PEMS Grain inspection complete:', inspectionId);
});
