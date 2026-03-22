import { LodgeRexPayload, SoapHeader } from 'src/interfaces';
import { buildExportDetails } from './sections/export-details.builder';
import { buildCertificateDetails } from './sections/certificate-details.builder';
import { buildProductLines } from './sections/product-lines.builder';
import { buildManufacturers } from './sections/manufacturers.builder';
import { buildAttachments, buildAdditionalTexts, buildEuTransit } from './sections/shared-sections.builder';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';
import { elem } from './xml-utils';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:lod="http://agriculture.gov.au/nexdoc/LodgeRexSoap_1.0"',
  'xmlns:com="http://agriculture.gov.au/nexdoc/common/CommonTypes_1.0"',
  'xmlns:com1="http://agriculture.gov.au/nexdoc/common/rex/CommonTypes_1.0"',
  'xmlns:fis="http://agriculture.gov.au/nexdoc/common/rex/FishTypes_1.0"',
  'xmlns:wool="http://agriculture.gov.au/nexdoc/common/rex/WoolTypes_1.0"',
  'xmlns:skin="http://agriculture.gov.au/nexdoc/common/rex/SkinsAndHidesTypes_1.0"',
  'xmlns:ined="http://agriculture.gov.au/nexdoc/common/rex/InedibleMeatTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildLodgeRexPayload(payload: LodgeRexPayload, header: SoapHeader): string {
  // identification only present for AMEND use of LodgeRex (legacy) — typically use AmendRexBuilder
  const identification = payload.identification
    ? elem('lod:identification',
        `<com:rexNumber>${payload.identification.rexNumber}</com:rexNumber>` +
        `<com1:lastAmendDateTime>${payload.identification.lastAmendDateTime}</com1:lastAmendDateTime>`)
    : '';

  const body = identification +
    elem('lod:exportDetails', buildExportDetails(payload.exportDetails)) +
    elem('lod:certificateDetails', buildCertificateDetails(payload.certificateDetails)) +
    elem('lod:productLines', buildProductLines(payload.productLines)) +
    elem('lod:manufacturers', buildManufacturers(payload.manufacturers)) +
    buildAttachments(payload.attachments, 'lod:attachments') +
    buildAdditionalTexts(payload.additionalTexts, 'lod:additionalTexts') +
    buildEuTransit(payload.euTransit, 'lod:euTransit');

  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <lod:LodgeRex>${body}</lod:LodgeRex>
  </soapenv:Body>
</soapenv:Envelope>`;
}
