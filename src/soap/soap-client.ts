import { EnvironmentConfig } from '../config/environment';
import {
  SoapHeader,
  OrderRexPayload,
  LodgeRexPayload,
  AmendRexPayload,
  ReplaceCertificatePayload,
  ReadRexPayload,
} from '../interfaces';
import {
  buildOrderRexPayload,
  buildLodgeRexPayload,
  buildAmendRexPayload,
  buildReplaceCertificatePayload,
  buildReadRexPayload,
} from './builders';
import { parseSoapResponse, parseReadRexResponse, SoapResult } from './response-parser';

// ─── SOAP Action constants ────────────────────────────────────────────────────
// SOAPAction header values follow the pattern: namespace/OperationName
const SOAP_ACTIONS = {
  orderRex:           'http://agriculture.gov.au/nexdoc/OrderRexSoap_1.0/OrderRex',
  lodgeRex:           'http://agriculture.gov.au/nexdoc/LodgeRexSoap_1.0/LodgeRex',
  amendRex:           'http://agriculture.gov.au/nexdoc/AmendRexSoap_1.0/AmendRex',
  replaceCertificate: 'http://agriculture.gov.au/nexdoc/RexCertificateSoap_1.0/ReplaceCertificate',
  readRex:            'http://agriculture.gov.au/nexdoc/ReadRexSoap_1.0/ReadRex',
} as const;

// ─── SoapClient ───────────────────────────────────────────────────────────────

export class SoapClient {
  private readonly header: SoapHeader;

  constructor(private readonly config: EnvironmentConfig) {
    this.header = {
      vendorToken:      config.vendorToken,
      clientGroupToken: config.clientGroupToken,
      clientToken:      config.clientToken,
      username:         config.soapUsername,
      password:         config.soapPassword,
    };
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  async orderRex(payload: OrderRexPayload): Promise<SoapResult> {
    const xml = buildOrderRexPayload(payload, this.header);
    return this.send(this.config.rexSubmissionServiceUrl, SOAP_ACTIONS.orderRex, xml);
  }

  async lodgeRex(payload: LodgeRexPayload): Promise<SoapResult> {
    const xml = buildLodgeRexPayload(payload, this.header);
    return this.send(this.config.rexSubmissionServiceUrl, SOAP_ACTIONS.lodgeRex, xml);
  }

  serializeLodgeRex(payload: LodgeRexPayload): string {
    return buildLodgeRexPayload(payload, this.header);
  }

  serializeOrderRex(payload: OrderRexPayload): string {
    return buildOrderRexPayload(payload, this.header);
  }

  async amendRex(payload: AmendRexPayload): Promise<SoapResult> {
    const xml = buildAmendRexPayload(payload, this.header);
    return this.send(this.config.rexSubmissionServiceUrl, SOAP_ACTIONS.amendRex, xml);
  }

  async replaceCertificate(payload: ReplaceCertificatePayload): Promise<SoapResult> {
    const xml = buildReplaceCertificatePayload(payload, this.header);
    return this.send(this.config.rexCertificateServiceUrl, SOAP_ACTIONS.replaceCertificate, xml);
  }

  async readRex(payload: ReadRexPayload): Promise<SoapResult> {
    const xml = buildReadRexPayload(payload, this.header);
    const raw = await this.send(this.config.readRexServiceUrl, SOAP_ACTIONS.readRex, xml);
    // Re-parse via the ReadRex-specific parser (same logic, named for clarity)
    if (!raw.success) return raw;
    return parseReadRexResponse(raw.rawXml);
  }

  // ─── Private HTTP transport ────────────────────────────────────────────────

  private async send(url: string, soapAction: string, body: string): Promise<SoapResult> {
    let responseText: string;
    let httpStatus: number;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction':   `"${soapAction}"`,
        },
        body,
      });

      httpStatus = response.status;
      responseText = await response.text();
    } catch (err) {
      // Network-level error (DNS, connection refused, timeout, etc.)
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        faultCode: 'NETWORK_ERROR',
        faultString: message,
        validationErrors: [],
        rawXml: '',
      };
    }

    // SOAP faults are returned with HTTP 500; parse the body regardless of status.
    // If the response doesn't contain a SOAP Envelope (e.g. a 404 HTML page),
    // surface it as a transport-level error instead.
    const isSoapResponse = /<(?:[\w]+:)?Envelope/i.test(responseText);
    if (!isSoapResponse) {
      return {
        success: false,
        faultCode: `HTTP_${httpStatus}`,
        faultString: `Non-SOAP response received (HTTP ${httpStatus})`,
        validationErrors: [],
        rawXml: responseText,
      };
    }

    return parseSoapResponse(responseText);
  }
}
