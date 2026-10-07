/**
 * lodge-horticulture-rex.spec.ts
 *
 * Bulk LODGE — Horticulture. Lodges one REX and appends its number to
 * test-results/lodged-horticulture-rex-numbers.txt (one per line,
 * safe for concurrent writers across parallel workers).
 *
 * Run many at once with --repeat-each and --workers (fullyParallel is off
 * project-wide, so pass --fully-parallel to actually run them concurrently):
 *
 *   npx playwright test tests/bulk/lodge-horticulture-rex.spec.ts --repeat-each=100 --workers=6 --fully-parallel
 *
 * Each LODGE creates a real REX in whatever environment ENV points to — try a
 * small --repeat-each first (e.g. 6) before running the full 100.
 */

import * as path from 'path';
import { test } from 'src/fixtures';
import { lodgeStep, appendLineSafely } from 'src/helpers';
import { buildDefaultLodgePayload } from 'test-data/commodities/horticulture';

const OUTPUT_FILE = path.resolve(process.cwd(), 'test-results', 'lodged-horticulture-rex-numbers.txt');

test('Bulk LODGE — Horticulture (saves REX number to file)', async ({ soapClient }) => {
  const lodgeState = await lodgeStep(soapClient, buildDefaultLodgePayload());
  console.log('LODGE complete:', lodgeState.rexNumber);

  appendLineSafely(OUTPUT_FILE, lodgeState.rexNumber);
});
