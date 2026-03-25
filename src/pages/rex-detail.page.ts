/**
 * rex-detail.page.ts
 *
 * Page Object for the REX record detail page.
 * Handles inspection, authorisation, and status checks.
 */

import { Page, Locator, expect } from '@playwright/test';

// ─── Types ────────────────────────────────────────────────────────────────────

export type REXStatus =
  | 'Ordered'
  | 'Lodged'
  | 'Amended'
  | 'INSPECTION'
  | 'CertificateReady'
  | 'Replaced'
  | 'Rejected';

export interface InspectionDetails {
  startDate:      string;   // ISO date string e.g. '2026-03-25'
  endDate:        string;
  inspectorName?: string;
  comments?:      string;
}

// ─── Page Object ──────────────────────────────────────────────────────────────

export class RexDetailPage {
  constructor(private readonly page: Page) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private addInspectionLink(): Locator {
    return this.page.getByRole('link', { name: 'Add Inspection' });
  }

  private startDateField(): Locator {
    return this.page.getByLabel('Inspection Start Date');
  }

  private endDateField(): Locator {
    return this.page.getByLabel('Inspection End Date');
  }

  private inspectorField(): Locator {
    return this.page.getByLabel('Inspector Name');
  }

  private inspectionCommentsField(): Locator {
    return this.page.getByLabel('Inspection Comments');
  }

  private saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  private authoriseLink(): Locator {
    return this.page.getByRole('link', { name: 'Authorise' });
  }

  private commentsField(): Locator {
    return this.page.getByLabel('Comments');
  }

  private submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  private statusLabel(): Locator {
    return this.page.getByTestId('rex-status');
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async addInspectionDetails(details: InspectionDetails): Promise<void> {
    await this.addInspectionLink().click();
    await this.page.waitForLoadState('networkidle');

    await this.startDateField().fill(details.startDate);
    await this.endDateField().fill(details.endDate);

    if (details.inspectorName) {
      await this.inspectorField().fill(details.inspectorName);
    }

    if (details.comments) {
      await this.inspectionCommentsField().fill(details.comments);
    }

    await this.saveButton().click();
    await this.page.waitForLoadState('networkidle');
  }

  async authorise(comments: string): Promise<void> {
    await this.authoriseLink().click();
    await this.page.waitForLoadState('networkidle');

    await this.commentsField().fill(comments);
    await this.submitButton().click();
    await this.page.waitForLoadState('networkidle');
  }

  async getREXStatus(): Promise<REXStatus> {
    const statusText = await this.statusLabel().innerText();
    return statusText.trim() as REXStatus;
  }

  async assertREXStatus(expected: REXStatus): Promise<void> {
    const actual = await this.getREXStatus();
    expect(actual, `Expected REX status '${expected}' but found '${actual}'`).toBe(expected);
  }
}
