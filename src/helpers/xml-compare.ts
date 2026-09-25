/**
 * xml-compare.ts
 *
 * Compares a downloaded certificate XML against an expected XML template
 * (see test-data/E2E/**\/*.xml). Templates use two markers for values that
 * vary per test run:
 *
 *   .*                              — wildcard, matches any text (dates, timestamps, etc.)
 *   {B[CertificateNumber_Approved]} — replaced with the actual certificate number
 *
 * Both XMLs are reformatted with the same options before comparing, so
 * differences in whitespace/indentation between the sample file and the
 * live download don't cause false mismatches.
 */

import * as fs from 'fs';
import * as path from 'path';
import format from 'xml-formatter';

const CERTIFICATE_NUMBER_PLACEHOLDER = '{B[CertificateNumber_Approved]}';
const WILDCARD = '.*';
const XML_FORMAT_OPTIONS = { collapseContent: true, indentation: '  ', lineSeparator: '\n' } as const;

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turns a formatted template into a regex: literal text is escaped, "*.*"
 * markers become wildcards, and the certificate number placeholder is
 * replaced with the (escaped) actual certificate number.
 */
function buildExpectedPattern(formattedTemplate: string, certificateNumber: string): RegExp {
  const pattern = formattedTemplate
    .split(CERTIFICATE_NUMBER_PLACEHOLDER)
    .map(part => part.split(WILDCARD).map(escapeRegex).join(WILDCARD))
    .join(escapeRegex(certificateNumber));

  return new RegExp(`^${pattern}$`, 's');
}

/** Reads an expected-XML template from test-data/<relativePath>. */
export function readExpectedCertificateXml(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), 'test-data', relativePath), 'utf-8');
}

/**
 * Asserts the downloaded certificate XML matches the expected template,
 * ignoring ".*"-marked dynamic fields and substituting certificateNumber
 * for the {B[CertificateNumber_Approved]} placeholder.
 *
 * Throws with both formatted XMLs in the error message on mismatch, so the
 * diff is visible in the test report / console output.
 */
export function assertCertificateXmlMatches(
  actualXml: string,
  expectedTemplate: string,
  certificateNumber: string,
): void {
  const formattedActual = format(actualXml, XML_FORMAT_OPTIONS);
  const formattedExpected = format(expectedTemplate, XML_FORMAT_OPTIONS);

  const pattern = buildExpectedPattern(formattedExpected, certificateNumber);

  if (!pattern.test(formattedActual)) {
    throw new Error(
      'Downloaded certificate XML did not match the expected template ' +
      `(certificateNumber="${certificateNumber}").\n\n` +
      `--- Actual ---\n${formattedActual}\n\n` +
      `--- Expected (template) ---\n${formattedExpected}\n`,
    );
  }
}
