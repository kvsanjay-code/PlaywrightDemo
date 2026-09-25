/**
 * read-certificate.spec.ts
 *
 * ReadCertificateService.ReadCertificate — fetches certificate details for a REX number.
 *
 * Flow: LODGE -> Staff Portal (inspect + authorise) -> ReadCertificate
 */

import { test, expect } from 'src/fixtures';
import { lodgeStep, readCertificateStep } from 'src/helpers';
import { buildDefaultLodgePayload } from 'test-data/commodities/horticulture';

// ─── TC-RC01: ReadCertificate returns certificate details for an authorised REX ─

test('TC-RC01 — LODGE -> authorise -> ReadCertificate returns certificate details', async ({
  soapClient,
  authoriseRex,
}) => {
  // Step 1 — LODGE
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
  console.log('LODGE complete:', lodgeState);

  // Step 2 — Staff Portal: login → search → inspect → authorise
  await authoriseRex(lodgeState.rexNumber, {
    authoriseComments: 'Authorised for ReadCertificate test — TC-RC01',
  });
  console.log('REX authorised:', lodgeState.rexNumber);

  // Step 3 — ReadCertificate
  const certificate = await readCertificateStep(soapClient, lodgeState.rexNumber);
  console.log('ReadCertificate complete:', certificate);

  // Assertions
  // Note: ReadCertificateService doesn't echo rexNumber back — readCertificateStep carries
  // through the value it was requested with, so asserting equality here wouldn't test anything.
  expect(certificate.certificateNumber, 'Should return an AU-prefixed certificate number').toMatch(/^AU\d+$/);
});

// ─── TC-RC02: ReadCertificate for an unknown REX number returns a fault ────────

test('TC-RC02 — ReadCertificate for an unknown rexNumber returns a fault', async ({ soapClient }) => {
  const result = await soapClient.readCertificate({ rexNumber: 'RC0000000' });
  console.log('TC-RC02 result (expected failure):', JSON.stringify(result, null, 2));

  expect(result.success, 'Should be rejected for an unknown rexNumber').toBe(false);
  if (!result.success) {
    console.log('Fault:', result.faultCode, result.faultString);
  }
});
