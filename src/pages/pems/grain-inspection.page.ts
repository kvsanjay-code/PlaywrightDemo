/**
 * grain-inspection.page.ts
 *
 * Steps only a Grain and Plant Product inspection (#/inspection/<id>/goods) has.
 * Ported from the standalone PEMS automation project.
 */

import { expect, Locator, Page } from '@playwright/test';
import { PemsInspectionPage } from './inspection.page';

export class GrainInspectionPage extends PemsInspectionPage {
  // ── Locators ────────────────────────────────────────────────────────────────

  private readonly changeOutcomeButton: Locator;
  private readonly declarationButton: Locator;

  constructor(page: Page) {
    super(page);
    this.changeOutcomeButton = page.getByTitle('Change outcome details');
    this.declarationButton = page.locator('#declaration-action');
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Answers No to both trade-description questions, so "meets the requirements" becomes Not Applicable. */
  async updateGrainOutcome({ outcomeType, rate }: { outcomeType: string; rate: string }): Promise<void> {
    await this.changeOutcomeButton.click();
    await this.dialog.locator('#isPhysicallyAppliedNo').check();
    await this.dialog.locator('#hasPhysicallyAppliedNo').check();
    await this.dialog.getByLabel('Outcome type').selectOption({ label: outcomeType });
    await this.dialog.getByRole('checkbox', { name: rate }).check();
    await this.saveDialog();
    await expect(this.field('Is a trade description required to be physically applied for the goods?')).toHaveText('No');
    await expect(this.field('Has a trade description been physically applied to the goods?')).toHaveText('No');
    await expect(this.field('Outcome type')).toHaveText(outcomeType);
    await expect(this.field(rate)).toHaveText('Yes');
  }

  async declare(): Promise<void> {
    await this.declarationButton.click();
    await this.dialog.getByRole('checkbox', { name: 'I declare that the commodity' }).check();
    await this.saveDialog();
  }

  /** Weight is per package; PEMS multiplies it by the line's package count to give the line weight. */
  async recordGrainLineResult({
    line,
    weightPerPackage,
    unit,
    result,
    expectedLineWeight,
  }: {
    line: string;
    weightPerPackage: string;
    unit: string;
    result: string;
    expectedLineWeight: string;
  }): Promise<void> {
    const row = this.resultsTable.getByRole('row').filter({ has: this.page.getByRole('cell', { name: line, exact: true }) });
    await row.getByRole('button', { name: 'Open' }).click();
    await this.dialog.getByRole('spinbutton', { name: 'Weight', exact: true }).fill(weightPerPackage);
    await this.dialog.locator('#packageWeightUnitId').selectOption({ label: unit });
    await this.dialog.getByLabel('Result', { exact: true }).selectOption({ label: result });
    await this.saveDialog();
    await expect(row.getByRole('cell').nth(4)).toHaveText(expectedLineWeight);
    await expect(row.getByRole('cell').nth(5)).toHaveText(unit);
    await expect(row.getByRole('cell').nth(6)).toHaveText(result);
  }
}
