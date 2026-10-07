/**
 * file-output.ts
 *
 * Parallel-safe file append, for tests that write a shared output file across
 * multiple workers (e.g. a bulk LODGE run collecting REX numbers). Uses the
 * same exclusive-lock-file technique as the PEMS project's REX pool
 * (C:\Playwright\Automation\PEMS\test-data\rexPool.ts), since plain concurrent
 * fs.appendFileSync calls can interleave/corrupt under parallel writes.
 */

import * as fs from 'fs';
import * as path from 'path';

const LOCK_TIMEOUT_MS = 10_000;

function withFileLock<T>(filePath: string, fn: () => T): T {
  const lockFile = `${filePath}.lock`;
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  let fd: number | undefined;
  while (fd === undefined) {
    try {
      fd = fs.openSync(lockFile, 'wx');
    } catch (err) {
      // Windows can report EPERM (not EEXIST) when racing to create a file another
      // process currently holds open — treat it the same as "lock is busy, retry".
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'EEXIST' && code !== 'EPERM') throw err;
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for ${lockFile}. Delete it if no tests are running.`);
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
  try {
    return fn();
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lockFile);
  }
}

/** Appends a line to a file, safe for concurrent writers across parallel Playwright workers. */
export function appendLineSafely(filePath: string, line: string): void {
  withFileLock(filePath, () => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.appendFileSync(filePath, line + '\n');
  });
}
