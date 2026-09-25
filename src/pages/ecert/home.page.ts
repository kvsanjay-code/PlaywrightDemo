/**
 * home.page.ts
 *
 * Page Object for the eCert home page.
 * Landing page after login — links through to certificate search.
 */

import { Page, Locator } from '@playwright/test';

export class ECertHomePage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private searchCertificatesLink(): Locator {
    return this.page.getByRole('link', { name: 'click here' });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Confirms the home page has loaded — used to detect a successful login. */
  async waitForLoad(): Promise<void> {
    await this.searchCertificatesLink().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async goToSearch(): Promise<void> {
    await this.searchCertificatesLink().click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
