/**
 * zdcn01-certificate-lifecycle.spec.ts
 *
 * E2E-ZDCN01 — Dairy (China) certificate lifecycle: Approved -> Replaced -> Revoked.
 * Dairy does not require Staff Portal authorisation before ReadCertificate
 * (unlike other commodities), so authoriseRex is omitted.
 *
 * See runCertificateLifecycleE2E for the shared lifecycle steps, and
 * test-data/E2E/Dairy/ZDCN01/ for this test case's payload and expected XMLs.
 */

import { test } from 'src/fixtures';
import { runCertificateLifecycleE2E } from 'src/helpers';
import { buildDefaultLodgePayload, buildDefaultReplacePayload } from 'test-data/commodities/dairy';
import { ZDCN01_PAYLOAD_OVERRIDES } from 'test-data/E2E/Dairy/ZDCN01/payload';

test('E2E-ZDCN01 — Dairy (China) certificate lifecycle: Approved -> Replaced -> Revoked', async ({
  soapClient,
  downloadCertificateXml,
  approveReplaceTask,
  approveCancelTask,
}) => {
  await runCertificateLifecycleE2E({
    soapClient,
    downloadCertificateXml,
    approveReplaceTask,
    approveCancelTask,
    buildLodgePayload: buildDefaultLodgePayload,
    buildReplacePayload: buildDefaultReplacePayload,
    payloadOverrides: ZDCN01_PAYLOAD_OVERRIDES,
    templates: {
      approved: 'E2E/Dairy/ZDCN01/Approved.xml',
      replaced: 'E2E/Dairy/ZDCN01/Replaced.xml',
      revoked:  'E2E/Dairy/ZDCN01/Revoked.xml',
    },
    label: 'ZDCN01',
  });
});
