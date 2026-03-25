/**
 * replace-flow.spec.ts
 *
 * Phase 8 — Hybrid REPLACE test cases.
 * End-to-end flows combining SOAP operations with Staff Portal UI actions.
 *
 * Flow: LODGE -> Staff Portal (inspect + authorise) -> READ REX -> REPLACE
 */

import { test, expect } from 'src/fixtures';
import { lodgeStep, readRexStep, replaceStep } from 'src/helpers';
import {
  buildDefaultLodgePayload,
  buildDefaultReplacePayload,
} from 'test-data/commodities/horticulture';

// ─── TC-R01: Full REPLACE flow — happy path ────────────────────────────────────

test('TC-R01 — full REPLACE flow: LODGE -> authorise -> REPLACE', async ({ soapClient, authoriseRex, rexDetailPage }) => {
  // Step 1 — LODGE
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
  console.log('LODGE complete:', lodgeState);

  // Step 2 — Portal: login → search → inspect → authorise
  await authoriseRex(lodgeState.rexNumber, {
    authoriseComments: 'Authorised for REPLACE test — TC-R01',
  });

  // Step 3 — Assert CertificateReady
  await rexDetailPage.assertREXStatus('CertificateReady');
  console.log('REX status confirmed: CertificateReady');

  // Step 4 — READ REX to get latest timestamp after portal actions
  const currentState = await readRexStep(soapClient, lodgeState.rexNumber);
  console.log('READ REX complete:', currentState);

  // Step 5 — REPLACE
  const replacePayload = buildDefaultReplacePayload(currentState, {
    reason: 'Certificate replacement — TC-R01 automated test',
  });
  const replaceResult = await replaceStep(soapClient, replacePayload);
  console.log('REPLACE complete:', replaceResult);

  // Assertions
  expect(replaceResult.serviceRequestId, 'REPLACE should return a serviceRequestId').toBeTruthy();
});

// ─── TC-R02: Assert CertificateReady status before REPLACE ─────────────────────

test('TC-R02 — verify REX status transitions to CertificateReady after authorisation', async ({ soapClient, authoriseRex, rexDetailPage }) => {
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());

  await authoriseRex(lodgeState.rexNumber, {
    authoriseComments: 'Authorised — TC-R02',
  });

  const status = await rexDetailPage.getREXStatus();
  expect(status, 'REX should be CertificateReady after authorisation').toBe('CertificateReady');
});

// ─── TC-R03: REPLACE response assertions ────────────────────────────────────────

test('TC-R03 — REPLACE response contains serviceRequestId and notices', async ({ soapClient, authoriseRex }) => {
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());

  await authoriseRex(lodgeState.rexNumber, {
    authoriseComments: 'Authorised — TC-R03',
  });

  // READ REX
  const preReplaceState = await readRexStep(soapClient, lodgeState.rexNumber);

  // REPLACE
  const replacePayload = buildDefaultReplacePayload(preReplaceState);
  const result = await soapClient.replaceCertificate(replacePayload);

  console.log('REPLACE result:', JSON.stringify(result, null, 2));

  expect(result.success, 'REPLACE should succeed').toBe(true);
  if (result.success) {
    expect(result.serviceRequestId, 'Response should contain serviceRequestId').toBeTruthy();
    console.log('ServiceRequestId:', result.serviceRequestId);
    console.log('Notices:', result.notices);
  }
});

// ─── TC-R04: REPLACE blocked when REX is not authorised (INSPECTION status) ────

test('TC-R04 — REPLACE rejected when REX is in INSPECTION status (not authorised)', async ({ soapClient, loginPage, rexSearchPage, rexDetailPage }) => {
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
  console.log('LODGE complete (no authorisation):', lodgeState);

  // Portal — login and add inspection but do NOT authorise
  await loginPage.login(process.env.STAFF_USERNAME!, process.env.STAFF_PASSWORD!);
  await rexSearchPage.searchByRexNumber(lodgeState.rexNumber);
  await rexDetailPage.addInspectionDetails({
    startDate: new Date().toISOString().split('T')[0],
    endDate:   new Date().toISOString().split('T')[0],
    comments: 'Inspection added but NOT authorised — TC-R04',
  });

  // Verify INSPECTION status
  const status = await rexDetailPage.getREXStatus();
  expect(status, 'REX should be in INSPECTION status').toBe('INSPECTION');

  // READ REX
  const currentState = await readRexStep(soapClient, lodgeState.rexNumber);

  // Attempt REPLACE — should be rejected
  const replacePayload = buildDefaultReplacePayload(currentState, {
    reason: 'Attempting REPLACE on non-authorised REX — TC-R04',
  });
  const result = await soapClient.replaceCertificate(replacePayload);

  console.log('REPLACE result (expected failure):', JSON.stringify(result, null, 2));

  expect(result.success, 'REPLACE should be rejected for non-authorised REX').toBe(false);
  if (!result.success) {
    expect(result.faultCode, 'Should return a fault code').toBeTruthy();
    console.log(`Fault: [${result.faultCode}] ${result.faultString}`);
  }
});
