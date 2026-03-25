/**
 * portal-workflow.ts
 *
 * Reusable Staff Portal workflow helpers.
 * Combines common multi-step portal interactions into single function calls.
 */

import { LoginPage, RexSearchPage, RexDetailPage, InspectionDetails } from '../pages';
import { config } from '../config/environment';

export interface PortalAuthoriseOptions {
  inspection?: Partial<InspectionDetails>;
  authoriseComments?: string;
}

export type AuthoriseRexFn = (rexNumber: string, options?: PortalAuthoriseOptions) => Promise<void>;

/**
 * Creates the authoriseRex function bound to the given page objects.
 * Called once in the fixture — tests just use authoriseRex(rexNumber).
 */
export function createAuthoriseRex(
  loginPage: LoginPage,
  rexSearchPage: RexSearchPage,
  rexDetailPage: RexDetailPage,
): AuthoriseRexFn {
  return async (rexNumber: string, options: PortalAuthoriseOptions = {}) => {
    const today = new Date().toISOString().split('T')[0];

    const inspection: InspectionDetails = {
      startDate: options.inspection?.startDate ?? today,
      endDate:   options.inspection?.endDate   ?? today,
      inspectorName: options.inspection?.inspectorName,
      comments:      options.inspection?.comments,
    };

    const comments = options.authoriseComments ?? 'Authorised via automated test';

    await loginPage.login(config.staffUsername, config.staffPassword);
    await rexSearchPage.searchByRexNumber(rexNumber);
    await rexDetailPage.inspectAndAuthorise(inspection, comments);
  };
}
