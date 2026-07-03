import { LodgeCustomCertificatePayload, SoapHeader } from 'src/interfaces';
import { reqElem, optElem, elem } from './xml-utils';
import { buildSoapHeader, SOAP_HEADER_NAMESPACES } from './soap-header.builder';

const NAMESPACES = [
  'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"',
  'xmlns:cus="http://agriculture.gov.au/nexdoc/CustomCertificateSoap_1.0"',
  'xmlns:cus1="http://agriculture.gov.au/nexdoc/common/customcertificate/CustomCertificateTypes_1.0"',
  SOAP_HEADER_NAMESPACES,
].join(' ');

export function buildLodgeCustomCertificatePayload(
  payload: LodgeCustomCertificatePayload,
  header: SoapHeader,
): string {
  return `<soapenv:Envelope ${NAMESPACES}>
  <soapenv:Header>${buildSoapHeader(header)}</soapenv:Header>
  <soapenv:Body>
    <cus:LodgeCustomCertificateDetails>
      ${buildConsigneeDetails(payload)}
      ${buildTransportDetails(payload)}
      ${buildAdditionalDetails(payload)}
      ${buildProductLines(payload)}
      <cus:exporterDeclaration>
        ${reqElem('cus1:exporterDeclarationCode', payload.exporterDeclarationCode)}
      </cus:exporterDeclaration>
    </cus:LodgeCustomCertificateDetails>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildConsigneeDetails(payload: LodgeCustomCertificatePayload): string {
  const cd = payload.consigneeDetails;
  const addr = cd.consigneeAddress;
  const street = addr.streetLine
    ? `<cus1:streetAddress><cus1:streetLine>${addr.streetLine}</cus1:streetLine></cus1:streetAddress>`
    : '';
  const addressXml =
    street +
    reqElem('cus1:city', addr.city) +
    optElem('cus1:state', addr.state) +
    reqElem('cus1:country', addr.country) +
    optElem('cus1:postalCode', addr.postalCode);

  return elem('cus:consigneeDetails',
    reqElem('cus1:consigneeName', cd.consigneeName) +
    elem('cus1:consigneeAddress', addressXml) +
    optElem('cus1:consigneeReferenceNumber', cd.consigneeReferenceNumber));
}

function buildTransportDetails(payload: LodgeCustomCertificatePayload): string {
  const td = payload.transportDetails;
  return elem('cus:transportDetails',
    reqElem('cus1:departureDate', td.departureDate) +
    reqElem('cus1:dischargePort', td.dischargePort) +
    reqElem('cus1:destinationCity', td.destinationCity) +
    reqElem('cus1:destinationCountry', td.destinationCountry) +
    optElem('cus1:voyageOrFlightNumber', td.voyageOrFlightNumber) +
    optElem('cus1:vesselName', td.vesselName));
}

function buildAdditionalDetails(payload: LodgeCustomCertificatePayload): string {
  const ad = payload.additionalDetails;
  const cpd = ad.certificatePrintDetails;

  const printDetailsXml =
    reqElem('cus1:certificatePrintIndicator', cpd.certificatePrintIndicator) +
    (cpd.certificatePrintRegion
      ? reqElem('cus1:certificatePrintRegion', cpd.certificatePrintRegion)
      : optElem('cus1:certificateRequiredClientGroup', cpd.certificateRequiredClientGroup));

  const permitsXml = ad.importPermits?.length
    ? elem('cus1:importPermits',
        ad.importPermits.map(p =>
          elem('cus1:importPermit',
            reqElem('cus1:importPermitNumber', p.importPermitNumber) +
            optElem('cus1:importPermitDate', p.importPermitDate))
        ).join(''))
    : '';

  return elem('cus:additionalDetails',
    reqElem('cus1:exporterReference', ad.exporterReference) +
    elem('cus1:certificatePrintDetails', printDetailsXml) +
    permitsXml);
}

function buildProductLines(payload: LodgeCustomCertificatePayload): string {
  const lines = payload.productLines.map(pl => {
    const containersXml = pl.containers?.length
      ? elem('cus1:containers',
          pl.containers.map(c => {
            const sealsXml = c.containerSeals?.length
              ? elem('cus1:containerSeals',
                  c.containerSeals.map(s =>
                    elem('cus1:containerSeal',
                      s.sealNumber
                        ? reqElem('cus1:sealNumber', s.sealNumber)
                        : optElem('cus1:sealStartNumber', s.sealStartNumber) +
                          optElem('cus1:sealEndNumber', s.sealEndNumber))
                  ).join(''))
              : '';
            return elem('cus1:container',
              reqElem('cus1:containerNumber', c.containerNumber) + sealsXml);
          }).join(''))
      : '';

    return elem('cus1:productLine',
      reqElem('cus1:requestLineNumber', pl.requestLineNumber) +
      reqElem('cus1:rexNumber', pl.rexNumber) +
      reqElem('cus1:rexProductLineNumber', pl.rexProductLineNumber) +
      reqElem('cus1:certificateLineNumber', pl.certificateLineNumber) +
      elem('cus1:productDetails',
        `<cus1:netQuantity unit="${pl.productDetails.netQuantity.unit}">${pl.productDetails.netQuantity.value}</cus1:netQuantity>` +
        `<cus1:outerPackageQuantity packageType="${pl.productDetails.outerPackageQuantity.packageType}">${pl.productDetails.outerPackageQuantity.value}</cus1:outerPackageQuantity>`) +
      containersXml);
  }).join('');

  return elem('cus:productLines', lines);
}
