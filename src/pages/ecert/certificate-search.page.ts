/**
 * certificate-search.page.ts
 *
 * Page Object for the eCert certificate search page.
 * Searches for a certificate by its certificate number and opens its details.
 */

import { Page, Locator } from '@playwright/test';

export class ECertSearchPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private certificateNumberInput(): Locator {
    return this.page.getByLabel('Certificate Number');
  }

  private searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search' });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async searchByCertificateNumber(certificateNumber: string): Promise<void> {
    await this.certificateNumberInput().fill(certificateNumber);
    await this.searchButton().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
