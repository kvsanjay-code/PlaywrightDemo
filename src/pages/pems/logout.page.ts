/**
 * logout.page.ts
 *
 * Page Object for the Self Service logout confirmation page.
 * Ported from the standalone PEMS automation project.
 */

import { expect, Locator, Page } from '@playwright/test';
import { PemsBasePage } from './base.page';

export class PemsLogoutPage extends PemsBasePage {
  // ── Locators ────────────────────────────────────────────────────────────────

  private readonly confirmationMessage: Locator;
  private readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationMessage = page.getByRole('heading', { name: 'You have successfully logged out.' });
    this.loginLink = page.getByRole('link', { name: 'LogIn' });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async expectLoggedOut(): Promise<void> {
    await expect(this.page).toHaveURL(/signout\.jspx/);
    await expect(this.confirmationMessage).toBeVisible();
    await expect(this.loginLink).toBeVisible();
  }
}
