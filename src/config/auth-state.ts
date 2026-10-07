/**
 * auth-state.ts
 *
 * Just the saved-session file path — deliberately has no other dependencies
 * (doesn't import environment.ts) so playwright.config.ts can reference it
 * synchronously at config-parse time without pulling in env var validation
 * before globalSetup has had a chance to run.
 */

import * as path from 'path';

export const STAFF_PORTAL_AUTH_FILE = path.resolve(process.cwd(), 'playwright', '.auth', 'staff-portal-state.json');

/** Guards global-setup.ts's real-login step so two concurrent test invocations never log in at once. */
export const STAFF_PORTAL_AUTH_LOCK_FILE = `${STAFF_PORTAL_AUTH_FILE}.lock`;
