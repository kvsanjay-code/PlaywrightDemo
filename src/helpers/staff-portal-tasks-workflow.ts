/**
 * staff-portal-tasks-workflow.ts
 *
 * Reusable Staff Portal (NEXDOC) task-approval workflow helpers.
 */

import { LoginPage, RexSearchPage, TasksPage, TaskDetailPage, ReplaceCertificatePage, CertificateReplacementOptionPage } from '../pages';
import { config } from '../config/environment';

export type ApproveReplaceTaskFn = (taskId: string, reasonOne?: string) => Promise<void>;

/**
 * Approves a certificate-replace task in the Staff Portal (NEXDOC):
 *
 *   login (if needed) -> Tasks -> search by task ID -> open task -> Approve
 *   (opens a new tab) -> select Reason 1 -> submit -> submit the certificate
 *   replacement option screen -> wait for the "replacements created" confirmation.
 *
 * Called once in the fixture — tests just use approveReplaceTask(taskId).
 */
export function createApproveReplaceTask(
  loginPage: LoginPage,
  rexSearchPage: RexSearchPage,
  tasksPage: TasksPage,
  taskDetailPage: TaskDetailPage,
): ApproveReplaceTaskFn {
  return async (taskId: string, reasonOne = 'ADDITION OF LINE') => {
    await loginPage.loginIfNeeded(config.staffUsername, config.staffPassword);
    await rexSearchPage.waitForLoad();

    await tasksPage.goToTasks();
    await tasksPage.searchByTaskId(taskId);
    await tasksPage.waitForResults(taskId);
    await tasksPage.openTask(taskId);

    const popup = await taskDetailPage.approve();

    const replaceCertificatePage = new ReplaceCertificatePage(popup);
    await replaceCertificatePage.selectReason1(reasonOne);
    await replaceCertificatePage.submit();

    const certificateReplacementOptionPage = new CertificateReplacementOptionPage(popup);
    await certificateReplacementOptionPage.submit();
    await certificateReplacementOptionPage.waitForReplacementCreated();
  };
}

export type ApproveCancelTaskFn = (taskId: string) => Promise<void>;

/**
 * Approves a CancelRex task in the Staff Portal (NEXDOC):
 *
 *   login (if needed) -> Exports -> Tasks -> search by task ID -> open task -> Approve.
 *
 * Unlike a replace task, approving a cancel task resolves in place — no popup,
 * no follow-up screen.
 *
 * Called once in the fixture — tests just use approveCancelTask(taskId).
 */
export function createApproveCancelTask(
  loginPage: LoginPage,
  rexSearchPage: RexSearchPage,
  tasksPage: TasksPage,
  taskDetailPage: TaskDetailPage,
): ApproveCancelTaskFn {
  return async (taskId: string) => {
    await loginPage.loginIfNeeded(config.staffUsername, config.staffPassword);
    await rexSearchPage.waitForLoad();
    await rexSearchPage.goToExports();

    await tasksPage.goToTasks();
    await tasksPage.searchByTaskId(taskId);
    await tasksPage.waitForResults(taskId);
    await tasksPage.openTask(taskId);

    await taskDetailPage.approveDirect();
  };
}
