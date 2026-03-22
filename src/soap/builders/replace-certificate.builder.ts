import { ReplaceCertificatePayload, SoapHeader } from 'src/interfaces';
import { buildExportDetails } from './sections/export-details.builder';
import { buildCertificateDetails } from './sections/certificate-details.builder';
import { buildProductLines } from './sections/product-lines.builder';
import { buildManufacturers } from './sections/manufacturers.builder';
import { buildAttachments, buildAdditionalTexts, buildEuTransit } from './sections/shared-sections.builder';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';
import { elem, optElem } from './xml-utils';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:rex="http://agriculture.gov.au/nexdoc/RexCertificateSoap_1.0"',
  'xmlns:com="http://agriculture.gov.au/nexdoc/common/CommonTypes_1.0"',
  'xmlns:com1="http://agriculture.gov.au/nexdoc/common/rex/CommonTypes_1.0"',
  'xmlns:fis="http://agriculture.gov.au/nexdoc/common/rex/FishTypes_1.0"',
  'xmlns:wool="http://agriculture.gov.au/nexdoc/common/rex/WoolTypes_1.0"',
  'xmlns:skin="http://agriculture.gov.au/nexdoc/common/rex/SkinsAndHidesTypes_1.0"',
  'xmlns:ined="http://agriculture.gov.au/nexdoc/common/rex/InedibleMeatTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildReplaceCertificatePayload(payload: ReplaceCertificatePayload, header: SoapHeader): string {
  const { rexDetails } = payload;

  // identification is MANDATORY for REPLACE
  const identification = elem('rex:identification',
    `<com:rexNumber>${rexDetails.identification.rexNumber}</com:rexNumber>` +
    `<com1:lastAmendDateTime>${rexDetails.identification.lastAmendDateTime}</com1:lastAmendDateTime>`);

  const rexDetailsXml = identification +
    elem('rex:exportDetails', buildExportDetails(rexDetails.exportDetails)) +
    elem('rex:certificateDetails', buildCertificateDetails(rexDetails.certificateDetails)) +
    elem('rex:productLines', buildProductLines(rexDetails.productLines)) +
    elem('rex:manufacturers', buildManufacturers(rexDetails.manufacturers)) +
    buildAttachments(rexDetails.attachments, 'rex:attachments') +
    buildAdditionalTexts(rexDetails.additionalTexts, 'rex:additionalTexts') +
    optElem('rex:newProductLinesOnly', rexDetails.newProductLinesOnly) +
    buildEuTransit(rexDetails.euTransit, 'rex:euTransit');

  const body =
    `<rex:reason>${payload.reason}</rex:reason>` +
    elem('rex:rexDetails', rexDetailsXml);

  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <rex:ReplaceCertificate>${body}</rex:ReplaceCertificate>
  </soapenv:Body>
</soapenv:Envelope>`;
}
