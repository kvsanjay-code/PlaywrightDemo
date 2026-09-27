/**
 * zdcn01-certificate-lifecycle.spec.ts
 *
 * E2E — Dairy (China) certificate lifecycle: Approved -> Replaced -> Revoked.
 *
 * Approved: LODGE -> ReadCertificate -> download certificate XML from eCert -> compare
 *           against china_ZDCN01_Approved.xml (dates ignored via ".*" markers).
 *           Staff Portal authorisation is NOT required for Dairy (unlike other
 *           commodities), so this step goes straight from LODGE to ReadCertificate.
 *
 * Replaced: REPLACE (departureDate pushed out to futureDateISO(10)) -> capture
 *           serviceRequestId -> [placeholder: Staff Portal approval of the service
 *           request — not yet automated] -> ReadCertificate for the new certificate
 *           number -> the original (Approved) certificate is now superseded, so it's
 *           verified against china_ZDCN01_Revoked.xml -> the new certificate is
 *           verified against china_ZDCN01_Replaced.xml (references both certificate
 *           numbers).
 *
 * Revoked:  READ REX -> CancelRex -> capture serviceRequestIdentifier -> [placeholder:
 *           Staff Portal approval of the service request — not yet automated] -> the
 *           Replaced certificate is now the Revoked one -> verified against
 *           china_ZDCN01_Revoked.xml.
 */

import * as fs from 'fs';
import { test } from 'src/fixtures';
import {
  lodgeStep,
  readRexStep,
  readCertificateStep,
  replaceStep,
  cancelRexStep,
  saveDownload,
  readExpectedCertificateXml,
  assertCertificateXmlMatches,
  futureDateISO,
  RexState,
} from 'src/helpers';
import { buildDefaultLodgePayload, buildDefaultReplacePayload } from 'test-data/commodities/dairy';

test('E2E-ZDCN01 — Dairy (China) certificate lifecycle: Approved -> Replaced -> Revoked', async ({
  soapClient,
  downloadCertificateXml,
}) => {
  let rexState: RexState;
  let certificateNumberApproved: string;
  let certificateNumberReplaced: string;

  await test.step('Approved', async () => {
    // Step 1 — LODGE (Dairy does not require Staff Portal authorisation before ReadCertificate)
    const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
    console.log('LODGE complete:', lodgeState);
    rexState = lodgeState;

    // Step 2 — ReadCertificateService: retrieve the certificate number
    const certificate = await readCertificateStep(soapClient, rexState.rexNumber);
    certificateNumberApproved = certificate.certificateNumber;
    console.log('Certificate number (Approved):', certificateNumberApproved);

    // Step 3 — Download the certificate XML from the eCert portal and compare
    const download = await downloadCertificateXml(certificateNumberApproved);
    const savedPath = await saveDownload(download, `${certificateNumberApproved}-approved.xml`);
    const actualXml = fs.readFileSync(savedPath, 'utf-8');

    const expectedXml = readExpectedCertificateXml('E2E/Dairy/china_ZDCN01_Approved.xml');
    assertCertificateXmlMatches(actualXml, expectedXml, certificateNumberApproved);
  });

  await test.step('Replaced', async () => {
    // Step 1 — REPLACE, with departureDate pushed out to futureDateISO(10)
    const replacePayload = buildDefaultReplacePayload(rexState, {
      departureDate: futureDateISO(10),
    });
    const replaceResult = await replaceStep(soapClient, replacePayload);
    console.log('REPLACE complete — serviceRequestId:', replaceResult.serviceRequestId);

    // Step 2 — Staff Portal: approve the service request (not yet automated)
    console.log(`TODO: Staff Portal approval required for serviceRequestId="${replaceResult.serviceRequestId}" (placeholder — not yet automated)`);

    // Step 3 — ReadCertificateService: retrieve the new certificate number
    const certificate = await readCertificateStep(soapClient, rexState.rexNumber);
    certificateNumberReplaced = certificate.certificateNumber;
    console.log('Certificate number (Replaced):', certificateNumberReplaced);

    const revokedTemplate = readExpectedCertificateXml('E2E/Dairy/china_ZDCN01_Revoked.xml');
    const replacedTemplate = readExpectedCertificateXml('E2E/Dairy/china_ZDCN01_Replaced.xml');

    // Step 4 — The original certificate is now superseded — verify it shows as Revoked
    const approvedDownload = await downloadCertificateXml(certificateNumberApproved);
    const approvedSavedPath = await saveDownload(approvedDownload, `${certificateNumberApproved}-revoked-after-replace.xml`);
    assertCertificateXmlMatches(fs.readFileSync(approvedSavedPath, 'utf-8'), revokedTemplate, certificateNumberApproved);

    // Step 5 — The new certificate should match the Replaced template (both cert numbers substituted)
    const replacedDownload = await downloadCertificateXml(certificateNumberReplaced);
    const replacedSavedPath = await saveDownload(replacedDownload, `${certificateNumberReplaced}-replaced.xml`);
    assertCertificateXmlMatches(fs.readFileSync(replacedSavedPath, 'utf-8'), replacedTemplate, {
      Approved: certificateNumberApproved,
      Replaced: certificateNumberReplaced,
    });
  });

  await test.step('Revoked', async () => {
    // Step 1 — READ REX for the latest lastAmendmentTimestamp before CANCEL
    const currentState = await readRexStep(soapClient, rexState.rexNumber);
    console.log('READ REX complete:', currentState);

    // Step 2 — CancelRex
    const cancelResult = await cancelRexStep(soapClient, currentState, 'Certificate revocation — E2E-ZDCN01 Revoked step');
    console.log('CancelRex complete — serviceRequestIdentifier:', cancelResult.serviceRequestIdentifier);

    // Step 3 — Staff Portal: approve the service request (not yet automated)
    console.log(`TODO: Staff Portal approval required for serviceRequestIdentifier="${cancelResult.serviceRequestIdentifier}" (placeholder — not yet automated)`);

    // Step 4 — The Replaced certificate is now the Revoked one — download and compare
    const certificateNumberRevoked = certificateNumberReplaced;
    const revokedTemplate = readExpectedCertificateXml('E2E/Dairy/china_ZDCN01_Revoked.xml');
    const download = await downloadCertificateXml(certificateNumberRevoked);
    const savedPath = await saveDownload(download, `${certificateNumberRevoked}-revoked.xml`);
    assertCertificateXmlMatches(fs.readFileSync(savedPath, 'utf-8'), revokedTemplate, certificateNumberRevoked);
  });
});
