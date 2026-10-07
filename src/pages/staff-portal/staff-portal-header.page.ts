/**
 * staff-portal-header.page.ts
 *
 * The user menu shown on every Staff Portal/NEXDOC screen (top right).
 */

import { Locator, Page } from '@playwright/test';

export class StaffPortalHeader {
  // ── Locators ────────────────────────────────────────────────────────────────

  private readonly userMenuButton: Locator;
  private readonly signOutMenuItem: Locator;

  constructor(private readonly page: Page) {
    // Button label is the logged-in user's initials + display name (e.g. "NA Nexdoc
    // Business", "NH Nexdoc Helpdesk1") — varies per account, matched generically on
    // "Nexdoc" rather than hardcoding one account's name.
    this.userMenuButton = page.getByRole('button', { name: /Nexdoc/i });
    this.signOutMenuItem = page.getByRole('menuitem', { name: 'Sign out' });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    await this.userMenuButton.click();
    await this.signOutMenuItem.click();
  }
}
