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

  /**
   * Shown instead of the portal or the login form when the account itself is
   * locked/disabled. Anchored on "contact the system administrator" rather than
   * the specific reason (locked vs disabled), since that phrase is the stable
   * boilerplate ending shared by this identity system's account-error pages
   * (the same ending also appears on the unrelated PEMS/OAM "System error" page).
   */
  private accountLockedError(): Locator {
    return this.page.getByText(/contact the system administrator/i);
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
    await this.submitAndVerify(username, password);
  }

  /**
   * Tries the portal URL first — if a session is already active, this is the only
   * navigation that happens and loginUrl is never touched. Falls back to loginUrl
   * (and submits credentials) if the portal shows a login form, OR if it shows an
   * account-locked/disabled error instead — that means the previously saved
   * session belongs to an account that's since been locked, so it's discarded in
   * favour of a fresh login with whatever credentials are passed in (e.g. trying
   * a different account after the first one got locked).
   */
  async loginIfNeeded(username: string, password: string): Promise<void> {
    await this.navigateToPortal();

    const isLoginForm = await this.usernameField().isVisible({ timeout: 3000 }).catch(() => false);
    if (!isLoginForm) {
      const isLocked = await this.accountLockedError().isVisible({ timeout: 1000 }).catch(() => false);
      if (!isLocked) return; // genuinely already authenticated
    }

    await this.navigate();
    await this.submitAndVerify(username, password);
  }

  /** Fills and submits the login form, then fails loudly if the account turns out to be locked. */
  private async submitAndVerify(username: string, password: string): Promise<void> {
    await this.usernameField().fill(username);
    await this.passwordField().fill(password);
    await this.loginButton().click();

    if (await this.accountLockedError().isVisible({ timeout: 5000 }).catch(() => false)) {
      throw new Error(`Staff Portal account "${username}" is locked or disabled — contact the system administrator.`);
    }

    await this.navigateToPortal();
  }
}
