/**
 * certificate-lifecycle-workflow.ts
 *
 * Shared E2E lifecycle for a certificate: Approved -> Replaced -> Revoked.
 * Each commodity/destination test case (e.g. Dairy China, Dairy Japan) differs
 * only in its payload overrides, its three expected XML templates, and whether
 * Staff Portal authorisation is required after LODGE — everything else about
 * the lifecycle is identical, so it lives here once.
 *
 * Approved: LODGE -> (authoriseRex, if required) -> ReadCertificate -> download
 *           certificate XML from eCert -> compare against templates.approved.
 *
 * Replaced: REPLACE (departureDate pushed out by replaceDepartureDaysOut) ->
 *           capture serviceRequestId -> Staff Portal approveReplaceTask ->
 *           ReadCertificate for the new certificate number -> the original
 *           (Approved) certificate is now superseded, so it's verified against
 *           templates.revoked -> the new certificate is verified against
 *           templates.replaced (references both certificate numbers).
 *
 *           ASSUMPTION: the Staff Portal Task ID that approveReplaceTask
 *           searches for is the same value as REPLACE's serviceRequestId.
 *
 * Revoked:  READ REX -> CancelRex -> capture serviceRequestIdentifier -> Staff
 *           Portal approveCancelTask -> the Replaced certificate is now the
 *           Revoked one -> verified against templates.revoked.
 */

import * as fs from 'fs';
import { test } from '@playwright/test';
import { SoapClient } from '../soap';
import { LodgeRexPayload, ReplaceCertificatePayload } from '../interfaces';
import { PayloadOverrides } from '../../test-data/payload-overrides';
import { lodgeStep, readRexStep, readCertificateStep, replaceStep, cancelRexStep, RexState } from './rex-workflow';
import { saveDownload } from './download-utils';
import { readExpectedCertificateXml, assertCertificateXmlMatches } from './xml-compare';
import { futureDateISO } from './string-utils';
import { AuthoriseRexFn } from './portal-workflow';
import { DownloadCertificateXmlFn } from './ecert-workflow';
import { ApproveReplaceTaskFn, ApproveCancelTaskFn } from './staff-portal-tasks-workflow';

export interface CertificateLifecycleTemplates {
  /** Paths relative to test-data/, e.g. 'E2E/Dairy/China/Approved.xml'. */
  approved: string;
  replaced: string;
  revoked:  string;
}

export interface CertificateLifecycleParams {
  soapClient: SoapClient;
  downloadCertificateXml: DownloadCertificateXmlFn;
  approveReplaceTask: ApproveReplaceTaskFn;
  approveCancelTask: ApproveCancelTaskFn;
  /** Only needed for commodities that require Staff Portal authorisation before ReadCertificate. */
  authoriseRex?: AuthoriseRexFn;
  buildLodgePayload: (overrides: PayloadOverrides) => LodgeRexPayload;
  buildReplacePayload: (state: RexState, overrides: PayloadOverrides) => ReplaceCertificatePayload;
  payloadOverrides: PayloadOverrides;
  templates: CertificateLifecycleTemplates;
  /** How far out to push departureDate for the REPLACE step. Defaults to 10 days. */
  replaceDepartureDaysOut?: number;
  /** Used in the CancelRex reason text for traceability in the SOAP logs. Defaults to 'lifecycle'. */
  label?: string;
}

export async function runCertificateLifecycleE2E(params: CertificateLifecycleParams): Promise<void> {
  const {
    soapClient, downloadCertificateXml, approveReplaceTask, approveCancelTask, authoriseRex,
    buildLodgePayload, buildReplacePayload, payloadOverrides, templates,
    replaceDepartureDaysOut = 10, label = 'lifecycle',
  } = params;

  let rexState: RexState;
  let certificateNumberApproved: string;
  let certificateNumberReplaced: string;

  await test.step('Approved', async () => {
    // Step 1 — LODGE, then Staff Portal authorisation if this commodity requires it
    const lodgeState = await lodgeStep(soapClient, buildLodgePayload(payloadOverrides));
    console.log('LODGE complete:', lodgeState);
    rexState = lodgeState;

    if (authoriseRex) {
      await authoriseRex(rexState.rexNumber);
      console.log('Staff Portal: REX authorised:', rexState.rexNumber);
    }

    // Step 2 — ReadCertificateService: retrieve the certificate number
    const certificate = await readCertificateStep(soapClient, rexState.rexNumber);
    certificateNumberApproved = certificate.certificateNumber;
    console.log('Certificate number (Approved):', certificateNumberApproved);

    // Step 3 — Download the certificate XML from the eCert portal and compare
    const download = await downloadCertificateXml(certificateNumberApproved);
    const savedPath = await saveDownload(download, `${certificateNumberApproved}-approved.xml`);
    const actualXml = fs.readFileSync(savedPath, 'utf-8');

    const expectedXml = readExpectedCertificateXml(templates.approved);
    assertCertificateXmlMatches(actualXml, expectedXml, certificateNumberApproved);
  });

  await test.step('Replaced', async () => {
    // Step 1 — REPLACE, with departureDate pushed out
    const replacePayload = buildReplacePayload(rexState, {
      ...payloadOverrides,
      departureDate: futureDateISO(replaceDepartureDaysOut),
    });
    const replaceResult = await replaceStep(soapClient, replacePayload);
    console.log('REPLACE complete — serviceRequestId:', replaceResult.serviceRequestId);

    // Step 2 — Staff Portal: approve the service request (Task ID assumed == serviceRequestId)
    await approveReplaceTask(replaceResult.serviceRequestId!);
    console.log('Staff Portal: replace task approved for serviceRequestId:', replaceResult.serviceRequestId);

    // Step 3 — ReadCertificateService: retrieve the new certificate number
    const certificate = await readCertificateStep(soapClient, rexState.rexNumber);
    certificateNumberReplaced = certificate.certificateNumber;
    console.log('Certificate number (Replaced):', certificateNumberReplaced);

    const revokedTemplate = readExpectedCertificateXml(templates.revoked);
    const replacedTemplate = readExpectedCertificateXml(templates.replaced);

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
    const cancelResult = await cancelRexStep(soapClient, currentState, `Certificate revocation — ${label} Revoked step`);
    console.log('CancelRex complete — serviceRequestIdentifier:', cancelResult.serviceRequestIdentifier);

    // Step 3 — Staff Portal: approve the service request
    await approveCancelTask(cancelResult.serviceRequestIdentifier);
    console.log('Staff Portal: cancel task approved for serviceRequestIdentifier:', cancelResult.serviceRequestIdentifier);

    // Step 4 — The Replaced certificate is now the Revoked one — download and compare
    const certificateNumberRevoked = certificateNumberReplaced;
    const revokedTemplate = readExpectedCertificateXml(templates.revoked);
    const download = await downloadCertificateXml(certificateNumberRevoked);
    const savedPath = await saveDownload(download, `${certificateNumberRevoked}-revoked.xml`);
    assertCertificateXmlMatches(fs.readFileSync(savedPath, 'utf-8'), revokedTemplate, certificateNumberRevoked);
  });
}
