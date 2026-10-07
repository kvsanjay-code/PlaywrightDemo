/**
 * process-lock.ts
 *
 * Cross-process exclusive lock using the same lock-file technique as
 * file-output.ts (fs.openSync 'wx' exclusive-create, with the Windows
 * EPERM-as-busy-retry fix), but for an async critical section rather than a
 * single synchronous file write — used to make sure only one
 * `npx playwright test` invocation ever performs a real Staff Portal login at
 * a time, even if two are started around the same moment.
 */

import * as fs from 'fs';

const DEFAULT_LOCK_TIMEOUT_MS = 120_000;

export async function withProcessLock<T>(
  lockFilePath: string,
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_LOCK_TIMEOUT_MS,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let fd: number | undefined;
  while (fd === undefined) {
    try {
      fd = fs.openSync(lockFilePath, 'wx');
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'EEXIST' && code !== 'EPERM') throw err;
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for ${lockFilePath}. Delete it if no other test run is in progress.`);
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  try {
    return await fn();
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lockFilePath);
  }
}
