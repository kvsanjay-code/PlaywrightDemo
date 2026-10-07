/**
 * login.page.ts
 *
 * Page Object for the Staff Portal login page.
 * Handles SIT and SIT2 login form variants.
 *
 * The login form and the portal itself live at different URLs. login() always
 * goes through loginUrl (used when a login is explicitly expected/required).
 * loginIfNeeded() tries portalUrl first — if a session is already active, the
 * portal loads directly and loginUrl is never visited at all; it only falls
 * back to loginUrl if the portal shows a login form instead of the portal.
 */

import { Page, Locator } from '@playwright/test';
import { Environment } from '../../config/environment';

export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly loginUrl: string,
    private readonly portalUrl: string,
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
    await this.page.goto(this.loginUrl);
  }

  async navigateToPortal(): Promise<void> {
    await this.page.goto(this.portalUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.navigate();
    await this.usernameField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();
    await this.navigateToPortal();
  }

  /**
   * Tries the portal URL first — if a session is already active, this is the only
   * navigation that happens and loginUrl is never touched. Only visits loginUrl
   * (and submits credentials) if the portal itself shows a login form instead.
   */
  async loginIfNeeded(username: string, password: string): Promise<void> {
    await this.navigateToPortal();
    const isLoginForm = await this.usernameField().isVisible({ timeout: 3000 }).catch(() => false);
    if (!isLoginForm) return;

    await this.navigate();
    await this.usernameField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();
    await this.navigateToPortal();
  }
}
