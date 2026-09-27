/**
 * xml-compare.ts
 *
 * Compares a downloaded certificate XML against an expected XML template
 * (see test-data/E2E/**\/*.xml). Templates use two markers for values that
 * vary per test run:
 *
 *   .*                              — wildcard for dynamic fields (dates, timestamps, etc.)
 *   {B[CertificateNumber_Approved]} — replaced with the actual certificate number
 *
 * The comparison masks those same dynamic fields in the downloaded XML down
 * to the literal ".*" text already used in the template, substitutes the real
 * certificate number into the template to build the concrete expected
 * outcome, then does a straight string comparison.
 *
 * The result is always logged (pass or fail), and a mismatch is recorded as
 * a soft failure rather than thrown — so it doesn't abort the rest of a
 * multi-step test (e.g. the Replaced/Revoked steps of the E2E lifecycle
 * test still run, and the tester can investigate the Approved mismatch
 * separately from whatever Replaced/Revoked report).
 */

import * as fs from 'fs';
import * as path from 'path';
import { expect } from '@playwright/test';
import format from 'xml-formatter';

const CERTIFICATE_NUMBER_PLACEHOLDER = '{B[CertificateNumber_Approved]}';
const XML_FORMAT_OPTIONS = { collapseContent: true, indentation: '  ', lineSeparator: '\n' } as const;

/** Element local names whose content varies per test run and gets masked to ".*" before comparing. */
const DYNAMIC_DATE_TAGS = ['issue_date', 'departure_date', 'date'];

/**
 * Masks known dynamic fields in a downloaded certificate XML down to the same
 * literal ".*" markers already used in the expected template, so the two can
 * be compared as plain strings. Extend DYNAMIC_DATE_TAGS (or add another
 * .replace() below) when a new template introduces another dynamic field.
 */
function maskDynamicFields(xml: string): string {
  let masked = xml;

  for (const tag of DYNAMIC_DATE_TAGS) {
    const pattern = new RegExp(`<(?:[\\w]+:)?${tag}(?:\\s[^>]*)?>[\\s\\S]*?<\\/(?:[\\w]+:)?${tag}>`, 'gi');
    masked = masked.replace(pattern, `<${tag}>.*</${tag}>`);
  }

  // related_document's "no" attribute (export permit number) also varies per run.
  masked = masked.replace(/(<related_document\b[^>]*\bno=")[^"]*(")/gi, '$1.*$2');

  return masked;
}

/** Reads an expected-XML template from test-data/<relativePath>. */
export function readExpectedCertificateXml(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), 'test-data', relativePath), 'utf-8');
}

/**
 * Compares the downloaded certificate XML against the expected template:
 * dynamic date fields are masked to ".*" on the actual side, and
 * {B[CertificateNumber_Approved]} is substituted with the real certificate
 * number on the expected side, before comparing as formatted strings.
 *
 * Always logs both sides (pass or fail). On a mismatch, records a soft
 * failure (test ends up reported as failed) without throwing, so the
 * caller's remaining steps keep running.
 */
export function assertCertificateXmlMatches(
  actualXml: string,
  expectedTemplate: string,
  certificateNumber: string,
): void {
  const expectedOutcome = expectedTemplate.split(CERTIFICATE_NUMBER_PLACEHOLDER).join(certificateNumber);

  const formattedActual = format(maskDynamicFields(actualXml), XML_FORMAT_OPTIONS);
  const formattedExpected = format(expectedOutcome, XML_FORMAT_OPTIONS);

  const passed = formattedActual === formattedExpected;

  console.log(
    `Certificate XML comparison (certificateNumber="${certificateNumber}") — ${passed ? 'MATCH' : 'MISMATCH'}\n` +
    `--Actual--\n${formattedActual}\n` +
    `--Expected--\n${formattedExpected}`,
  );

  expect.soft(
    formattedActual,
    `Downloaded certificate did not match the expected template (certificateNumber="${certificateNumber}")`,
  ).toBe(formattedExpected);
}
