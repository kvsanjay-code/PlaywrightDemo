/**
 * login.page.ts
 *
 * Page Object for the Staff Portal login page.
 * Handles SIT and SIT2 login form variants.
 */

import { Page, Locator } from '@playwright/test';
import { Environment } from '../../config/environment';

export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly baseUrl: string,
    private readonly env: Environment,
  ) {}

  // ── Locators ────────────────────────────────────────────────────────────────

  private usernameField(): Locator {
    return this.env === 'sit2'
      ? this.page.getByRole('textbox', { name: 'Email or Client ID' })
      : this.page.getByLabel('Username');
  }

  private passwordField(): Locator {
    return this.env === 'sit2'
      ? this.page.getByRole('textbox', { name: 'password' })
      : this.page.getByLabel('Password');
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
    await this.usernameField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();
    await this.page.waitForURL(`${this.baseUrl}/**`, { waitUntil: 'networkidle' });
  }
}
