/**
 * download-utils.ts
 *
 * Persists Playwright Downloads to disk so failed comparisons can be
 * inspected after the run. Saved under test-results/ (gitignored, same
 * as other run artifacts) rather than tracked in the repo.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Download } from '@playwright/test';

const DOWNLOADS_DIR = path.resolve(process.cwd(), 'test-results', 'downloads');

/** Saves a Download under test-results/downloads/<fileName> and returns its full path. */
export async function saveDownload(download: Download, fileName: string): Promise<string> {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  const filePath = path.join(DOWNLOADS_DIR, fileName);
  await download.saveAs(filePath);
  return filePath;
}
