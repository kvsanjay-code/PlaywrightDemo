import { ReleaseRexToPrintPayload, SoapHeader } from 'src/interfaces';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:lod="http://agriculture.gov.au/nexdoc/LodgeRexSoap_1.0"',
  'xmlns:com="http://agriculture.gov.au/nexdoc/common/CommonTypes_1.0"',
  'xmlns:com1="http://agriculture.gov.au/nexdoc/common/rex/CommonTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildReleaseRexToPrintPayload(payload: ReleaseRexToPrintPayload, header: SoapHeader): string {
  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <lod:ReleaseRexToPrinter>
      <lod:identification>
        <com:rexNumber>${payload.rexNumber}</com:rexNumber>
        <com1:lastAmendDateTime>${payload.lastAmendDateTime}</com1:lastAmendDateTime>
      </lod:identification>
    </lod:ReleaseRexToPrinter>
  </soapenv:Body>
</soapenv:Envelope>`;
}
