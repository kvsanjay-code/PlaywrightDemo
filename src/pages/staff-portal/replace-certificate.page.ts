/**
 * replace-certificate.page.ts
 *
 * Page Object for the Staff Portal (NEXDOC) "Replace certificate" page
 * (opens in a new tab after approving a replace task). Selects a
 * replacement reason and submits.
 */

import { Page, Locator } from '@playwright/test';

export class ReplaceCertificatePage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private reason1Select(): Locator {
    return this.page.getByLabel('Reason 1');
  }

  private submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async selectReason1(reason: string): Promise<void> {
    await this.reason1Select().selectOption({ label: reason });
  }

  async submit(): Promise<void> {
    await this.submitButton().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
