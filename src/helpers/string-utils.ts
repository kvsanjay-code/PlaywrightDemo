/**
 * string-utils.ts
 *
 * General-purpose string utility helpers for test data generation.
 */

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Returns an ISO date string (YYYY-MM-DD) for a date N days from today.
 */
export function futureDateISO(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

/**
 * Generates a random alphanumeric string of the given length.
 * Suitable for use as an exporterReference or any unique string field.
 *
 * @param length - Number of characters to generate (default: 8)
 * @returns Uppercase alphanumeric string e.g. "A3FX92BK"
 */
export function randomAlphanumeric(length: number = 8): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return result;
}

/**
 * Generates a random exporter reference with an optional prefix.
 *
 * @param prefix - Optional prefix e.g. 'REF' → 'REF-A3FX92BK'
 * @returns Reference string e.g. "REF-A3FX92BK"
 */
export function randomExporterReference(prefix: string = 'REF'): string {
  return `${prefix}-${randomAlphanumeric(8)}`;
}
