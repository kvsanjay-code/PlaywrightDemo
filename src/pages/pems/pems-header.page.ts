/**
 * pems-header.page.ts
 *
 * The header shown on every PEMS screen.
 * Ported from the standalone PEMS automation project.
 */

import { Locator, Page } from '@playwright/test';

export class PemsHeader {
  // ── Locators ────────────────────────────────────────────────────────────────

  private readonly selfServiceHomeLink: Locator;

  constructor(private readonly page: Page) {
    // The header and the mobile menu each render a link back to Self Service; use the header one.
    this.selfServiceHomeLink = page.locator('#self-service-home');
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async backToSelfService(): Promise<void> {
    await this.selfServiceHomeLink.click();
  }
}
