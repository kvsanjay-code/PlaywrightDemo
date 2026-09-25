/**
 * login.page.ts
 *
 * Page Object for the eCert login page.
 */

import { Page, Locator } from '@playwright/test';

export class ECertLoginPage {
  constructor(
    private readonly page: Page,
    private readonly baseUrl: string,
  ) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private loginField(): Locator {
    return this.page.getByLabel('Login');
  }

  private passwordField(): Locator {
    return this.page.getByLabel('Password');
  }

  private loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.navigate();
    await this.loginField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();
  }

  async loginIfNeeded(username: string, password: string): Promise<void> {
    await this.navigate();
    const isLoginForm = await this.loginField().isVisible({ timeout: 3000 }).catch(() => false);
    if (!isLoginForm) return;
    await this.loginField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();
  }
}
