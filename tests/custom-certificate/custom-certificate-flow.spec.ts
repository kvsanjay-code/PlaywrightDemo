/**
 * custom-certificate-flow.spec.ts
 *
 * End-to-end flow: LODGE horticulture REX (printIndicator=C)
 *   → Staff Portal inspect + authorise
 *   → LodgeCustomCertificateDetails (CustomCertificateService)
 */

import { test, expect } from 'src/fixtures';
import { lodgeStep, lodgeCustomCertificateStep, releaseCustomCertificateToPrintStep, toCustomCertIdentification } from 'src/helpers';
import { buildDefaultLodgePayload } from 'test-data/commodities/horticulture';
import { buildDefaultLodgeCustomCertificatePayload } from 'test-data/custom-certificate-defaults';
import { PrintIndicator } from 'src/interfaces';

// ─── TC-CC01: Full CustomCertificate flow — happy path ──────────────────────────

test('TC-CC01 — LODGE (C) → authorise → LodgeCustomCertificateDetails', async ({
  soapClient,
  authoriseRex,
}) => {
  // Step 1 — Lodge horticulture REX with print indicator C
  const lodgeState = await lodgeStep(
    soapClient,
    buildDefaultLodgePayload({ printIndicator: PrintIndicator.Custom }),
  );
  console.log('LODGE complete:', lodgeState);

  // Step 2 — Staff Portal: login → search → inspect → authorise
  await authoriseRex(lodgeState.rexNumber, {
    authoriseComments: 'Authorised for CustomCertificate flow — TC-CC01',
  });
  console.log('REX authorised:', lodgeState.rexNumber);

  // Step 3 — Lodge CustomCertificate (net weight from REX defaults: 500 KG)
  const certResult = await lodgeCustomCertificateStep(
    soapClient,
    buildDefaultLodgeCustomCertificatePayload(lodgeState.rexNumber),
  );
  console.log('LodgeCustomCertificate complete:', certResult);

  // Assertions
  expect(certResult.customCertificateRequestId, 'Should return a customCertificateRequestId').toBeTruthy();
  expect(certResult.complianceStatus, 'Compliance status should be COMP').toBe('COMP');
  expect(certResult.customCertificateLines.length, 'Should have at least one certificate line').toBeGreaterThan(0);

  console.log('CustomCertificateRequestId:', certResult.customCertificateRequestId);
  console.log('ComplianceStatus:', certResult.complianceStatus);
  console.log('CertificateLines:', certResult.customCertificateLines);
});

// ─── TC-CC02: Missing voyageOrFlightNumber → business rule fault ─────────────

test('TC-CC02 — missing voyageOrFlightNumber triggers business rule fault', async ({
  soapClient,
  authoriseRex,
}) => {
  // Step 1 — Lodge and authorise
  const lodgeState = await lodgeStep(
    soapClient,
    buildDefaultLodgePayload({ printIndicator: PrintIndicator.Custom }),
  );
  await authoriseRex(lodgeState.rexNumber, { authoriseComments: 'Authorised — TC-CC02' });

  // Step 2 — Call service directly with voyageOrFlightNumber omitted
  const result = await soapClient.lodgeCustomCertificate(
    buildDefaultLodgeCustomCertificatePayload(lodgeState.rexNumber, {
      voyageOrFlightNumber: null,
    }),
  );
  console.log('TC-CC02 result (expected failure):', JSON.stringify(result, null, 2));

  // Assertions
  expect(result.success, 'Should be rejected when voyageOrFlightNumber is missing').toBe(false);
  if (!result.success) {
    expect(result.faultItems.length, 'Should return at least one fault item').toBeGreaterThan(0);
    console.log('Fault:', result.faultCode, result.faultString);
    console.log('Fault items:', result.faultItems);
  }
});

// ─── TC-CC03: Empty consigneeName → OSB schema validation fault ──────────────

test('TC-CC03 — empty consigneeName triggers OSB-382505 schema validation fault', async ({
  soapClient,
  authoriseRex,
}) => {
  // Step 1 — Lodge and authorise
  const lodgeState = await lodgeStep(
    soapClient,
    buildDefaultLodgePayload({ printIndicator: PrintIndicator.Custom }),
  );
  await authoriseRex(lodgeState.rexNumber, { authoriseComments: 'Authorised — TC-CC03' });

  // Step 2 — Call service directly with consigneeName as empty string
  // Empty string triggers OSB-382505: "string value '' does not match RestrictedAlphaNumeric70Type"
  const result = await soapClient.lodgeCustomCertificate(
    buildDefaultLodgeCustomCertificatePayload(lodgeState.rexNumber, {
      consigneeName: '',
    }),
  );
  console.log('TC-CC03 result (expected failure):', JSON.stringify(result, null, 2));

  // Assertions
  expect(result.success, 'Should be rejected when consigneeName is empty').toBe(false);
  if (!result.success) {
    expect(result.osbFault, 'Should return an OSB fault for schema validation failure').toBeTruthy();
    expect(result.osbFault?.errorCode, 'OSB error code should be OSB-382505').toBe('OSB-382505');
    console.log('OSB fault:', result.osbFault);
  }
});

// ─── TC-CC04: Capture customCertificateRequestId and lastAmendmentTimestamp ───

test('TC-CC04 — LODGE (C) → authorise → capture requestId and timestamp', async ({
  soapClient,
  authoriseRex,
}) => {
  // Step 1 — Lodge horticulture REX with print indicator C
  const lodgeState = await lodgeStep(
    soapClient,
    buildDefaultLodgePayload({ printIndicator: PrintIndicator.Custom }),
  );
  console.log('LODGE complete:', lodgeState);

  // Step 2 — Staff Portal: login → search → inspect → authorise
  await authoriseRex(lodgeState.rexNumber, {
    authoriseComments: 'Authorised — TC-CC04',
  });
  console.log('REX authorised:', lodgeState.rexNumber);

  // Step 3 — Lodge CustomCertificate and capture response identifiers
  const certResult = await lodgeCustomCertificateStep(
    soapClient,
    buildDefaultLodgeCustomCertificatePayload(lodgeState.rexNumber),
  );

  const { customCertificateRequestId, lastAmendmentTimestamp } = certResult;
  console.log('CustomCertificateRequestId:', customCertificateRequestId);
  console.log('LastAmendmentTimestamp:    ', lastAmendmentTimestamp);

  expect(customCertificateRequestId, 'customCertificateRequestId should be present').toBeTruthy();
  expect(lastAmendmentTimestamp,     'lastAmendmentTimestamp should be present').toBeTruthy();

  // Step 4 — Release CustomCertificate to print
  const releaseResult = await releaseCustomCertificateToPrintStep(
    soapClient,
    toCustomCertIdentification(certResult),
  );
  console.log('ReleaseCustomCertificateToPrint complete:', releaseResult);

  // Assertions
  expect(releaseResult.complianceStatus, 'Compliance status should be COMP').toBe('COMP');
  expect(releaseResult.permitNumber,     'Permit number should be present').toBeTruthy();
});
