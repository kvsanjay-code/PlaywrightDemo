import { AmendRexPayload, SoapHeader } from '../interfaces';
import { buildExportDetails } from './sections/export-details.builder';
import { buildCertificateDetails } from './sections/certificate-details.builder';
import { buildProductLines } from './sections/product-lines.builder';
import { buildManufacturers } from './sections/manufacturers.builder';
import { buildAttachments, buildAdditionalTexts, buildEuTransit } from './sections/shared-sections.builder';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';
import { elem, optElem } from './xml-utils';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:amen="http://agriculture.gov.au/nexdoc/AmendRexSoap_1.0"',
  'xmlns:com="http://agriculture.gov.au/nexdoc/common/CommonTypes_1.0"',
  'xmlns:com1="http://agriculture.gov.au/nexdoc/common/rex/CommonTypes_1.0"',
  'xmlns:fis="http://agriculture.gov.au/nexdoc/common/rex/FishTypes_1.0"',
  'xmlns:wool="http://agriculture.gov.au/nexdoc/common/rex/WoolTypes_1.0"',
  'xmlns:skin="http://agriculture.gov.au/nexdoc/common/rex/SkinsAndHidesTypes_1.0"',
  'xmlns:ined="http://agriculture.gov.au/nexdoc/common/rex/InedibleMeatTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildAmendRexPayload(payload: AmendRexPayload, header: SoapHeader): string {
  // identification is MANDATORY for AMEND
  const identification = elem('amen:identification',
    `<com:rexNumber>${payload.identification.rexNumber}</com:rexNumber>` +
    `<com1:lastAmendDateTime>${payload.identification.lastAmendDateTime}</com1:lastAmendDateTime>`);

  const body = identification +
    elem('amen:exportDetails', buildExportDetails(payload.exportDetails)) +
    elem('amen:certificateDetails', buildCertificateDetails(payload.certificateDetails)) +
    elem('amen:productLines', buildProductLines(payload.productLines)) +
    elem('amen:manufacturers', buildManufacturers(payload.manufacturers)) +
    buildAttachments(payload.attachments, 'amen:attachments') +
    buildAdditionalTexts(payload.additionalTexts, 'amen:additionalTexts') +
    buildEuTransit(payload.euTransit, 'amen:euTransit') +
    optElem('amen:submitAmendmentRequest', payload.submitAmendmentRequest) +
    optElem('amen:amendmentReason', payload.amendmentReason);

  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <amen:AmendRex>${body}</amen:AmendRex>
  </soapenv:Body>
</soapenv:Envelope>`;
}
