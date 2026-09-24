/**
 * ecert-workflow.ts
 *
 * Reusable eCert workflow helpers.
 * Combines common multi-step eCert interactions into single function calls.
 */

import { Download } from '@playwright/test';
import { ECertLoginPage, ECertHomePage, ECertSearchPage, ECertCertificateDetailsPage } from '../pages';
import { config } from '../config/environment';

export type DownloadCertificateXmlFn = (certificateNumber: string) => Promise<Download>;

/**
 * Creates the downloadCertificateXml function bound to the given page objects.
 * Called once in the fixture — tests just use downloadCertificateXml(certificateNumber).
 *
 * Flow: login (if needed) -> home -> search by certificate number -> download XML.
 */
export function createDownloadCertificateXml(
  loginPage: ECertLoginPage,
  homePage: ECertHomePage,
  searchPage: ECertSearchPage,
  detailsPage: ECertCertificateDetailsPage,
): DownloadCertificateXmlFn {
  return async (certificateNumber: string) => {
    await loginPage.loginIfNeeded(config.ecertUsername, config.ecertPassword);
    await homePage.goToSearch();
    await searchPage.searchByCertificateNumber(certificateNumber);
    return detailsPage.downloadCertificateXml();
  };
}
