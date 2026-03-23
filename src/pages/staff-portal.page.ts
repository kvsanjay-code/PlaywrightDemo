/**
 * staff-portal.page.ts
 *
 * Page Object for the REX Staff Portal.
 * Encapsulates all UI interactions needed by hybrid SOAP + portal test flows.
 *
 * NOTE: Selectors are based on expected portal structure.
 *       Confirm and update against the actual portal HTML before running.
 */

import { Page, expect } from '@playwright/test';

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
  startDate:     string;   // ISO date string e.g. '2026-03-24'
  endDate:       string;   // ISO date string
  inspectorName?: string;
  comments?:     string;
}

// ─── Page Object ──────────────────────────────────────────────────────────────

export class StaffPortalPage {
  constructor(
    private readonly page: Page,
    private readonly baseUrl: string,
  ) {}

  // ── login ──────────────────────────────────────────────────────────────────

  /**
   * Navigates to the staff portal and logs in with the given credentials.
   * Waits until the dashboard/home page is visible before returning.
   */
  async login(username: string, password: string): Promise<void> {
    await this.page.goto(this.baseUrl);
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
    // Wait for the portal home — confirm selector against actual portal
    await this.page.waitForURL(`${this.baseUrl}/**`, { waitUntil: 'networkidle' });
  }

  // ── findByREXNumber ────────────────────────────────────────────────────────

  /**
   * Searches for a REX record by its number and navigates to the detail view.
   * Waits until the REX record is displayed before returning.
   */
  async findByREXNumber(rexNumber: string): Promise<void> {
    await this.page.getByLabel('REX Number').fill(rexNumber);
    await this.page.getByRole('button', { name: 'Search' }).click();
    // Click the matching row/link in search results
    await this.page.getByRole('link', { name: rexNumber }).click();
    // Wait for the record detail to load
    await this.page.waitForLoadState('networkidle');
  }

  // ── addInspectionDetails ───────────────────────────────────────────────────

  /**
   * Opens the inspection details form and fills in the provided fields.
   * Call this before authorise().
   */
  async addInspectionDetails(details: InspectionDetails): Promise<void> {
    await this.page.getByRole('link', { name: 'Add Inspection' }).click();
    await this.page.waitForLoadState('networkidle');

    await this.page.getByLabel('Inspection Start Date').fill(details.startDate);
    await this.page.getByLabel('Inspection End Date').fill(details.endDate);

    if (details.inspectorName) {
      await this.page.getByLabel('Inspector Name').fill(details.inspectorName);
    }

    if (details.comments) {
      await this.page.getByLabel('Inspection Comments').fill(details.comments);
    }

    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── authorise ─────────────────────────────────────────────────────────────

  /**
   * Clicks the Authorise link, enters comments, and submits.
   * After this call the REX status should transition to CertificateReady.
   */
  async authorise(comments: string): Promise<void> {
    await this.page.getByRole('link', { name: 'Authorise' }).click();
    await this.page.waitForLoadState('networkidle');

    await this.page.getByLabel('Comments').fill(comments);
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── getREXStatus ──────────────────────────────────────────────────────────

  /**
   * Reads and returns the current REX status shown on the record detail page.
   */
  async getREXStatus(): Promise<REXStatus> {
    // Confirm the selector and text values against the actual portal
    const statusText = await this.page.getByTestId('rex-status').innerText();
    return statusText.trim() as REXStatus;
  }

  // ── assertREXStatus ────────────────────────────────────────────────────────

  /**
   * Asserts that the current REX status matches the expected value.
   */
  async assertREXStatus(expected: REXStatus): Promise<void> {
    const actual = await this.getREXStatus();
    expect(actual, `Expected REX status '${expected}' but found '${actual}'`).toBe(expected);
  }
}
