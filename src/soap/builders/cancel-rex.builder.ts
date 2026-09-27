import { CancelRexPayload, SoapHeader } from 'src/interfaces';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';
import { optElem } from './xml-utils';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:can="http://agriculture.gov.au/nexdoc/CancelRexSoap_1.0"',
  'xmlns:com="http://agriculture.gov.au/nexdoc/common/CommonTypes_1.0"',
  'xmlns:com1="http://agriculture.gov.au/nexdoc/common/rex/CommonTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildCancelRexPayload(payload: CancelRexPayload, header: SoapHeader): string {
  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <can:CancelRex>
      <can:identification>
        <com:rexNumber>${payload.identification.rexNumber}</com:rexNumber>
        <com1:lastAmendDateTime>${payload.identification.lastAmendDateTime}</com1:lastAmendDateTime>
      </can:identification>
      ${optElem('can:reason', payload.reason)}
    </can:CancelRex>
  </soapenv:Body>
</soapenv:Envelope>`;
}
