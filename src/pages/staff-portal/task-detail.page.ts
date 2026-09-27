/**
 * task-detail.page.ts
 *
 * Page Object for the Staff Portal (NEXDOC) Task detail page.
 * Approving a replace task opens the Replace Certificate flow in a new tab;
 * approving a cancel task resolves in place with no follow-up screen.
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

  /**
   * Clicks Approve, which opens the Replace Certificate flow in a new tab, then
   * closes this Task detail tab so only the new tab remains open, and returns it.
   */
  async approve(): Promise<Page> {
    const [newTab] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.approveButton().click(),
    ]);
    await newTab.waitForLoadState('domcontentloaded');
    await this.page.close();
    return newTab;
  }

  /** Clicks Approve for tasks that resolve in place, with no follow-up tab (e.g. Cancel tasks). */
  async approveDirect(): Promise<void> {
    await this.approveButton().click();
  }

  async reject(): Promise<void> {
    await this.rejectButton().click();
  }
}
