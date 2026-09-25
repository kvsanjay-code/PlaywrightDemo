/**
 * zdcn01-certificate-lifecycle.spec.ts
 *
 * E2E — Dairy (China) certificate lifecycle: Approved -> Replaced -> Revoked.
 *
 * Approved: LODGE -> Staff Portal authorise (COMP) -> ReadCertificate -> download
 *           certificate XML from eCert -> compare against the sample template,
 *           ignoring date fields (see test-data/E2E/Dairy/china_ZDCN01_Approved.xml).
 *
 * Replaced / Revoked: TODO — steps to be provided.
 */

import * as fs from 'fs';
import { test } from 'src/fixtures';
import {
  lodgeStep,
  readCertificateStep,
  saveDownload,
  readExpectedCertificateXml,
  assertCertificateXmlMatches,
} from 'src/helpers';
import { buildDefaultLodgePayload } from 'test-data/commodities/dairy';

test('E2E-ZDCN01 — Dairy (China) certificate lifecycle: Approved -> Replaced -> Revoked', async ({
  soapClient,
  authoriseRex,
  downloadCertificateXml,
}) => {
  let certificateNumber: string;

  await test.step('Approved', async () => {
    // Step 1 — LODGE to COMP state
    const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
    console.log('LODGE complete:', lodgeState);

    // Step 2 — Staff Portal: login → search → inspect → authorise (brings REX to COMP)
    await authoriseRex(lodgeState.rexNumber, {
      authoriseComments: 'Authorised for E2E-ZDCN01 Approved step',
    });
    console.log('REX authorised:', lodgeState.rexNumber);

    // Step 3 — ReadCertificateService: retrieve the certificate number
    const certificate = await readCertificateStep(soapClient, lodgeState.rexNumber);
    certificateNumber = certificate.certificateNumber;
    console.log('Certificate number:', certificateNumber);

    // Step 4 — Download the certificate XML from the eCert portal
    const download = await downloadCertificateXml(certificateNumber);
    const savedPath = await saveDownload(download, `${certificateNumber}-approved.xml`);
    const actualXml = fs.readFileSync(savedPath, 'utf-8');

    // Step 5 — Compare against the sample template (dates ignored via ".*" markers)
    const expectedXml = readExpectedCertificateXml('E2E/Dairy/china_ZDCN01_Approved.xml');
    assertCertificateXmlMatches(actualXml, expectedXml, certificateNumber);
  });

  await test.step('Replaced', async () => {
    // TODO: steps to be provided
  });

  await test.step('Revoked', async () => {
    // TODO: steps to be provided
  });
});
