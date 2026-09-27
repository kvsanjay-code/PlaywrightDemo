/**
 * tasks.page.ts
 *
 * Page Object for the Staff Portal (NEXDOC) Tasks list page.
 * Searches for a task by Task ID and opens it.
 */

import { Page, Locator } from '@playwright/test';

export class TasksPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private tasksNavLink(): Locator {
    return this.page.getByRole('link', { name: 'Tasks' });
  }

  // NOTE: label unverified against the live app — the Tasks filter form only
  // showed "Show tasks" (status dropdown) and an adjacent unlabelled-looking
  // field in the screenshot. Adjust this locator once confirmed.
  private taskIdInput(): Locator {
    return this.page.getByLabel('Task ID');
  }

  private searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search' });
  }

  private taskRow(taskId: string): Locator {
    return this.page.getByRole('link', { name: taskId });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async goToTasks(): Promise<void> {
    await this.tasksNavLink().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchByTaskId(taskId: string): Promise<void> {
    await this.taskIdInput().fill(taskId);
    await this.searchButton().click();
  }

  async waitForResults(taskId: string): Promise<void> {
    await this.taskRow(taskId).waitFor({ state: 'visible', timeout: 30_000 });
  }

  async openTask(taskId: string): Promise<void> {
    await this.taskRow(taskId).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
