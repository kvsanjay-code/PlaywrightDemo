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

/**
 * Full portal authorisation flow: login → search → inspect → authorise.
 * Reusable across any test that needs a REX authorised via the staff portal.
 */
export async function portalAuthoriseFlow(
  loginPage: LoginPage,
  rexSearchPage: RexSearchPage,
  rexDetailPage: RexDetailPage,
  rexNumber: string,
  options: PortalAuthoriseOptions = {},
): Promise<void> {
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
}
