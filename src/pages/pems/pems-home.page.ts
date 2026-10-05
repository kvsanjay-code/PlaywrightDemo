/**
 * pems-home.page.ts
 *
 * Page Object for the PEMS application home page — create-inspection tiles.
 */

import { expect, Locator, Page } from '@playwright/test';
import { PemsBasePage } from './base.page';
import { PemsCreateInspectionDialog } from './create-inspection-dialog.page';

export class PemsHomePage extends PemsBasePage {
  // ── Locators ────────────────────────────────────────────────────────────────

  private readonly heading: Locator;
  private readonly horticultureTile: Locator;
  private readonly grainTile: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 2, name: 'Plant Exports Management System' });
    this.horticultureTile = page.locator('#create-horticulture');
    this.grainTile = page.locator('#create-goods');
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/pems\/#\/home/);
    await expect(this.heading).toBeVisible();
  }

  async openCreateHorticulture(): Promise<PemsCreateInspectionDialog> {
    await this.horticultureTile.click();
    const dialog = new PemsCreateInspectionDialog(this.page, 'Create Horticulture Inspection');
    await dialog.expectOpen();
    return dialog;
  }

  async openCreateGrain(): Promise<PemsCreateInspectionDialog> {
    await this.grainTile.click();
    const dialog = new PemsCreateInspectionDialog(this.page, 'Create Grain and Plant Product Inspection');
    await dialog.expectOpen();
    return dialog;
  }
}
