/**
 * portal-home.page.ts
 *
 * Page Object for the Self Service home page (post-login landing page).
 * Links through to the PEMS application.
 */

import { expect, Locator, Page } from '@playwright/test';
import { PemsBasePage } from './base.page';

export class PemsPortalHomePage extends PemsBasePage {
  // ── Locators ────────────────────────────────────────────────────────────────

  private readonly welcomeUser: Locator;
  private readonly logoutLink: Locator;
  private readonly pemsTile: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeUser = page.getByRole('button', { name: /^Welcome / });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
    // The Services tile renders an icon and a "PEMS" caption as two separate links to the
    // same place — .first() avoids a strict-mode violation if both match by accessible name.
    this.pemsTile = page.getByRole('link', { name: 'PEMS' }).first();
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async expectLoggedIn(): Promise<void> {
    await this.waitForPageReady();
    await expect(this.page).toHaveTitle('Home');
    await expect(this.welcomeUser).toBeVisible();
  }

  /**
   * Clicking the Services tile occasionally doesn't register under parallel load (works
   * reliably when done manually) — wait for it to be genuinely interactive first, then
   * retry the click once if navigation hasn't happened after a reasonable wait.
   */
  async openPems(): Promise<void> {
    await this.pemsTile.waitFor({ state: 'visible', timeout: 30_000 });
    await this.pemsTile.click();
    try {
      await this.page.waitForURL(/\/pems\//, { timeout: 15_000 });
    } catch {
      await this.pemsTile.click();
      await this.page.waitForURL(/\/pems\//);
    }
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
