import { ReleaseCustomCertificateToPrintPayload, SoapHeader } from 'src/interfaces';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:cus="http://agriculture.gov.au/nexdoc/CustomCertificateSoap_1.0"',
  'xmlns:cus1="http://agriculture.gov.au/nexdoc/common/customcertificate/CustomCertificateTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildReleaseCustomCertificateToPrintPayload(
  payload: ReleaseCustomCertificateToPrintPayload,
  header: SoapHeader,
): string {
  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <cus:ReleaseCustomCertificateToPrint>
      <cus:identification>
        <cus1:customCertificateRequestId>${payload.customCertificateRequestId}</cus1:customCertificateRequestId>
        <cus1:lastAmendDateTime>${payload.lastAmendDateTime}</cus1:lastAmendDateTime>
      </cus:identification>
    </cus:ReleaseCustomCertificateToPrint>
  </soapenv:Body>
</soapenv:Envelope>`;
}
