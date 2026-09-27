/**
 * task-detail.page.ts
 *
 * Page Object for the Staff Portal (NEXDOC) Task detail page.
 * Approving a replace task opens the Replace Certificate flow in a new tab.
 */

import { Page, Locator } from '@playwright/test';

export class TaskDetailPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private approveButton(): Locator {
    return this.page.getByRole('button', { name: 'APPROVE' });
  }

  private rejectButton(): Locator {
    return this.page.getByRole('button', { name: 'REJECT' });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Clicks Approve and returns the new tab it opens (the Replace Certificate flow). */
  async approve(): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.approveButton().click(),
    ]);
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  async reject(): Promise<void> {
    await this.rejectButton().click();
  }
}
