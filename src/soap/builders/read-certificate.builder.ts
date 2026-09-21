import { ReadCertificatePayload, SoapHeader } from 'src/interfaces';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:read="http://agriculture.gov.au/nexdoc/ReadCertificateSoap_1.0"',
  'xmlns:com="http://agriculture.gov.au/nexdoc/common/CommonTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildReadCertificatePayload(payload: ReadCertificatePayload, header: SoapHeader): string {
  const body = `<read:identification><com:rexNumber>${payload.rexNumber}</com:rexNumber></read:identification>`;

  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <read:ReadCertificate>${body}</read:ReadCertificate>
  </soapenv:Body>
</soapenv:Envelope>`;
}
