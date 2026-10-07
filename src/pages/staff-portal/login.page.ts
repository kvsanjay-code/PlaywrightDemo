/**
 * login.page.ts
 *
 * Page Object for the Staff Portal login page.
 * Handles SIT and SIT2 login form variants.
 *
 * The login form and the portal itself live at different URLs, and (by design,
 * confirmed, can't be changed) each only behaves correctly for one session
 * state: portalUrl without a session shows the locked-looking error screen —
 * not evidence of a real lockout, just what it always shows pre-authentication
 * — while loginUrl *with* an active session 404s instead of showing the form.
 * So loginIfNeeded() always checks portalUrl first: no locked screen there
 * means a session is already active (the real portal loaded), so it's done.
 * Only once the locked screen confirms there's no session does it go to
 * loginUrl — which at that point is guaranteed to show the real form, never
 * the 404, since there's nothing to 404 against. A genuine lockout is only
 * ever confirmed afterwards, from the locked-screen check that runs right
 * after actually submitting credentials. login() is the explicit, unconditional
 * version — always submits credentials via loginUrl — for call sites that know
 * for certain there's no session to begin with.
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
   * Checks portalUrl first, never loginUrl — portalUrl reliably tells us whether
   * a session is active (real portal loads) or not (locked screen), whereas
   * loginUrl behaves correctly only when we already know there's no session
   * (otherwise it 404s). Only on confirming there's no session does this fall
   * through to loginUrl, where the real lockout check happens post-submission.
   */
  async loginIfNeeded(username: string, password: string): Promise<void> {
    await this.navigateToPortal();

    const isLocked = await this.accountLockedError().isVisible({ timeout: 3000 }).catch(() => false);
    if (!isLocked) return; // session already active — this is the real portal

    // No session yet — portalUrl always shows the locked screen without one.
    // loginUrl is safe to visit now; it only 404s when a session already exists.
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
