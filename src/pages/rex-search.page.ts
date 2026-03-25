/**
 * rex-search.page.ts
 *
 * Page Object for the REX search / home page.
 * Allows searching for a REX record by number and navigating to its detail view.
 */

import { Page, Locator } from '@playwright/test';

export class RexSearchPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private rexNumberInput(): Locator {
    return this.page.getByLabel('REX Number');
  }

  private searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search' });
  }

  private rexLink(rexNumber: string): Locator {
    return this.page.getByRole('link', { name: rexNumber });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async searchByRexNumber(rexNumber: string): Promise<void> {
    await this.rexNumberInput().fill(rexNumber);
    await this.searchButton().click();
    await this.rexLink(rexNumber).click();
    await this.page.waitForLoadState('networkidle');
  }
}
