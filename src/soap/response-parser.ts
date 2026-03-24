// Parses raw SOAP XML responses into typed result objects.
// Uses regex-based extraction to avoid adding an XML library dependency.

// ─── Shared types ────────────────────────────────────────────────────────────

export interface ParsedNotice {
  noticeId: string;
  noticeType: 'I' | 'W' | 'E';   // I=Informational, W=Warning, E=Error
  noticeMessage: string;
}

export interface ParsedFaultItem {
  faultCode: string;
  faultReason: 'ERROR' | 'INFORMATIONAL' | 'WARNING';
  faultMessage: string;
}

export interface ParsedRexLine {
  lineNumber: string;
  healthCertificateDescription?: string;
  templateCode?: string;
  endorsementNumber?: string;
}

export interface SoapSuccessResult {
  success: true;
  rexNumber?: string;
  lastAmendmentTimestamp?: string;
  complianceStatus?: string;
  exporterReferences?: string;
  permitNumber?: string;          // present when complianceStatus = 'COMP'
  notices: ParsedNotice[];
  rexLines: ParsedRexLine[];
  rawXml: string;
}

export interface SoapFaultResult {
  success: false;
  faultCode: string;
  faultString: string;
  faultItems: ParsedFaultItem[];
  rawXml: string;
}

export type SoapResult = SoapSuccessResult | SoapFaultResult;

// ─── Tag extraction helpers ───────────────────────────────────────────────────

/**
 * Extracts the text content of the first matching XML element.
 * Handles both prefixed tags (e.g. <soapenv:Fault>) and unprefixed (e.g. <faultcode>).
 */
function extractTag(xml: string, localName: string): string | undefined {
  // Match <prefix:localName> or <localName> with optional attributes
  const pattern = new RegExp(`<(?:[\\w]+:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w]+:)?${localName}>`, 'i');
  const match = xml.match(pattern);
  return match ? match[1].trim() : undefined;
}

/**
 * Extracts all occurrences of a repeated element (e.g. <message>) into an array of raw XML strings.
 */
function extractAll(xml: string, localName: string): string[] {
  const pattern = new RegExp(`<(?:[\\w]+:)?${localName}(?:\\s[^>]*)?>[\\s\\S]*?<\\/(?:[\\w]+:)?${localName}>`, 'gi');
  return xml.match(pattern) ?? [];
}

/**
 * Extracts a named attribute value from an XML element opening tag.
 */
function extractAttr(tag: string, attrName: string): string | undefined {
  const pattern = new RegExp(`${attrName}="([^"]*)"`, 'i');
  return tag.match(pattern)?.[1];
}

// ─── Fault detection ─────────────────────────────────────────────────────────

function isFault(xml: string): boolean {
  return /<(?:[\w]+:)?Fault[\s>]/i.test(xml);
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseFault(xml: string): SoapFaultResult {
  const faultCode   = extractTag(xml, 'faultcode')   ?? extractTag(xml, 'Code')   ?? 'UNKNOWN';
  const faultString = extractTag(xml, 'faultstring') ?? extractTag(xml, 'faultString') ?? extractTag(xml, 'Reason') ?? 'Unknown fault';

  const faultItems: ParsedFaultItem[] = extractAll(xml, 'NexdocSoapFaultItem').map(itemXml => ({
    faultCode:    extractTag(itemXml, 'FaultCode')    ?? '',
    faultReason:  (extractTag(itemXml, 'FaultReason') ?? 'ERROR') as ParsedFaultItem['faultReason'],
    faultMessage: extractTag(itemXml, 'FaultMessage') ?? '',
  }));

  return { success: false, faultCode, faultString, faultItems, rawXml: xml };
}

function parseNotices(xml: string): ParsedNotice[] {
  return extractAll(xml, 'notice').map(noticeXml => ({
    noticeId:      extractTag(noticeXml, 'noticeId')      ?? '',
    noticeType:    (extractTag(noticeXml, 'noticeType')    ?? 'I') as ParsedNotice['noticeType'],
    noticeMessage: extractTag(noticeXml, 'noticeMessage')  ?? '',
  }));
}

function parseRexLines(xml: string): ParsedRexLine[] {
  return extractAll(xml, 'rexLine').map(lineXml => ({
    lineNumber:                   extractTag(lineXml, 'lineNumber')                   ?? '',
    healthCertificateDescription: extractTag(lineXml, 'healthCertificateDescription'),
    templateCode:                 extractTag(lineXml, 'templateCode'),
    endorsementNumber:            extractTag(lineXml, 'endorsementNumber'),
  }));
}

function parseSuccess(xml: string): SoapSuccessResult {
  // rexNumber may appear as <rexNumber>, <requestNumber>, or <REXNumber>
  const rexNumber =
    extractTag(xml, 'rexNumber') ??
    extractTag(xml, 'requestNumber') ??
    extractTag(xml, 'REXNumber');

  const lastAmendmentTimestamp =
    extractTag(xml, 'lastAmendmentTimestamp') ??
    extractTag(xml, 'lastAmendDateTime');

  // Note: actual response has a typo — <complianceStaus> (missing 't')
  const complianceStatus =
    extractTag(xml, 'complianceStatus') ??
    extractTag(xml, 'complianceStaus');

  const exporterReferences = extractTag(xml, 'exporterReferences');
  const permitNumber       = extractTag(xml, 'permitNumber');

  return {
    success: true,
    rexNumber,
    lastAmendmentTimestamp,
    complianceStatus,
    exporterReferences,
    permitNumber,
    notices:  parseNotices(xml),
    rexLines: parseRexLines(xml),
    rawXml: xml,
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function parseSoapResponse(xml: string): SoapResult {
  if (isFault(xml)) {
    return parseFault(xml);
  }
  return parseSuccess(xml);
}

/**
 * Parses a ReadRex response. Returns the same shape as SoapSuccessResult but
 * callers can also inspect rawXml for additional fields not yet modelled.
 */
export function parseReadRexResponse(xml: string): SoapResult {
  return parseSoapResponse(xml);
}
