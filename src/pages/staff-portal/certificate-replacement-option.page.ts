/**
 * certificate-replacement-option.page.ts
 *
 * Page Object for the Staff Portal (NEXDOC) "Certificate replacement option"
 * page — the second screen of the Replace Certificate new-tab flow. Submits
 * with the pre-filled defaults and confirms the replacement was created.
 */

import { Page, Locator } from '@playwright/test';

export class CertificateReplacementOptionPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  private replacementCreatedBanner(): Locator {
    return this.page.getByText('Certificate replacements created');
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async submit(): Promise<void> {
    await this.submitButton().click();
  }

  async waitForReplacementCreated(): Promise<void> {
    await this.replacementCreatedBanner().waitFor({ state: 'visible', timeout: 30_000 });
  }
}
