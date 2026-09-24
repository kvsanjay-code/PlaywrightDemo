/**
 * certificate-details.page.ts
 *
 * Page Object for the eCert certificate details page.
 * Handles downloading the certificate XML, confirming, printing, and status checks.
 */

import { Page, Locator, Download } from '@playwright/test';

export class ECertCertificateDetailsPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private downloadButton(): Locator {
    return this.page.getByRole('button', { name: 'Download' });
  }

  private confirmButton(): Locator {
    return this.page.getByRole('button', { name: 'Confirm' });
  }

  private printButton(): Locator {
    return this.page.getByRole('button', { name: 'Print' });
  }

  private statusValue(): Locator {
    return this.page.getByText('Status').locator('..').getByText(/Approved|Rejected|Pending/);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Clicks Download and waits for the resulting file download (the certificate XML).
   * Returns Playwright's Download object — callers decide whether to saveAs() it,
   * read its stream, or just assert on its suggestedFilename().
   */
  async downloadCertificateXml(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton().click(),
    ]);
    return download;
  }

  async confirm(): Promise<void> {
    await this.confirmButton().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async print(): Promise<void> {
    await this.printButton().click();
  }

  async getStatus(): Promise<string> {
    const statusText = await this.statusValue().innerText();
    return statusText.trim();
  }
}
