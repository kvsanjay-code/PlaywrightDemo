/**
 * login.page.ts
 *
 * Page Object for the PEMS Self Service sign-in page (Oracle Access Manager).
 * Ported from the standalone PEMS automation project.
 */

import { expect, Locator, Page } from '@playwright/test';
import { PemsBasePage } from './base.page';

/** Self Service home path; unauthenticated visits redirect to the sign-in page. */
const SELF_SERVICE_HOME_PATH = '/selfservice/faces/oracle/webcenter/portalapp/pages/private/home.jsf?impersonate=external';

export class PemsLoginPage extends PemsBasePage {
  // ── Locators ────────────────────────────────────────────────────────────────

  private readonly heading: Locator;
  private readonly userId: Locator;
  private readonly password: Locator;
  private readonly termsCheckbox: Locator;
  private readonly loginButton: Locator;
  private readonly signedInGreeting: Locator;
  private readonly accessManagerError: Locator;

  private readonly baseUrl: string;

  constructor(page: Page, pemsUrl: string) {
    super(page);
    // Accepts either a bare origin or a full URL (e.g. including the Self Service home
    // path) — only the origin is actually used, same as the source project's BASE_URL handling.
    this.baseUrl = new URL(pemsUrl).origin;
    this.heading = page.getByRole('heading', { level: 1, name: /Welcome to the Department of Agriculture/ });
    this.userId = page.getByRole('textbox', { name: 'Enter User ID' });
    this.password = page.getByRole('textbox', { name: 'Enter Password' });
    this.termsCheckbox = page.getByRole('checkbox', { name: 'I accept the' });
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.signedInGreeting = page.getByRole('button', { name: /^Welcome / });
    this.accessManagerError = page.getByText('System error. Please contact the System Administrator.');
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.skipAdfSplashScreen();
    await this.page.goto(`${this.baseUrl}${SELF_SERVICE_HOME_PATH}`);
    await this.waitForPageReady();
    await expect(this.heading).toBeVisible();
  }

  /**
   * Oracle Access Manager intermittently answers a valid login with "System error". That happens
   * before any test data is touched, so it is safe to reload the sign-in page and try once more.
   */
  async login(username: string, password: string): Promise<void> {
    await this.navigate();
    await this.submitCredentials(username, password);
    if (await this.landedOnAccessManagerError()) {
      await this.navigate();
      await this.submitCredentials(username, password);
      if (await this.landedOnAccessManagerError()) {
        throw new Error('Oracle Access Manager returned "System error" on two consecutive logins.');
      }
    }
  }

  async loginIfNeeded(username: string, password: string): Promise<void> {
    await this.navigate();
    const isLoginForm = await this.userId.isVisible({ timeout: 3000 }).catch(() => false);
    if (!isLoginForm) return;
    await this.submitCredentials(username, password);
    if (await this.landedOnAccessManagerError()) {
      await this.navigate();
      await this.submitCredentials(username, password);
      if (await this.landedOnAccessManagerError()) {
        throw new Error('Oracle Access Manager returned "System error" on two consecutive logins.');
      }
    }
  }

  private async submitCredentials(username: string, password: string): Promise<void> {
    await this.userId.fill(username);
    await this.password.fill(password);
    await expect(this.loginButton).toBeDisabled();
    await this.termsCheckbox.check();
    await expect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
  }

  private async landedOnAccessManagerError(): Promise<boolean> {
    await expect(this.signedInGreeting.or(this.accessManagerError)).toBeVisible({ timeout: 30_000 });
    return this.accessManagerError.isVisible();
  }
}
