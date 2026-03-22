import { ExportDetails } from 'src/interfaces';
import { optElem, reqElem, elem } from '../xml-utils';
import { buildAddress, buildAddressSection } from './address.builder';

export function buildExportDetails(details: ExportDetails | undefined): string {
  if (!details) return '';
  return `
    ${reqElem('com1:commodityType', details.commodityType)}
    ${optElem('com1:priority', details.priority)}
    ${optElem('com1:departureDate', details.departureDate)}
    ${buildTransportDetails(details)}
    ${optElem('com1:destinationCity', details.destinationCity)}
    ${buildDischargePorts(details)}
    ${reqElem('com1:destinationCountry', details.destinationCountry)}
    ${buildTransitCountries(details)}
    ${optElem('com1:borderInspectionPort', details.borderInspectionPort)}
    ${buildLoadingPorts(details)}
    ${buildImportPermits(details)}
    ${buildSewExport(details)}
    ${optElem('com1:ownerExporterId', details.ownerExporterId)}
    ${buildExporterDeclaration(details)}
    ${buildImaDetailsList(details)}
    ${optElem('com1:exporterReference', details.exporterReference)}
    ${buildConsigneeDetails(details)}
    ${buildMessageAcknowledgements(details)}
    ${optElem('com1:preferredWeightUnit', details.preferredWeightUnit)}
    ${optElem('com1:tracesApprovalId', details.tracesApprovalId)}
    ${optElem('com1:productUseIndicator', details.productUseIndicator)}
    ${optElem('com1:importedProductFlag', details.importedProductFlag)}
    ${optElem('com1:manufacturedTreatedPackagedLabelledInAustralia', details.manufacturedTreatedPackagedLabelledInAustralia)}
    ${optElem('com1:legallyImported', details.legallyImported)}
    ${optElem('com1:lotNumber', details.lotNumber)}
    ${optElem('com1:storageEstablishmentNumber', details.storageEstablishmentNumber)}
    ${optElem('com1:quotaYear', details.quotaYear)}
    ${optElem('com1:quotaFlag', details.quotaFlag)}
    ${optElem('com1:quotaType', details.quotaType)}
    ${optElem('com1:shipStoresFlag', details.shipStoresFlag)}
    ${optElem('com1:exemptionCode', details.exemptionCode)}
    ${optElem('com1:authorisationFlag', details.authorisationFlag)}
    ${buildAuthorisationDetails(details)}
    ${buildEuContactInformation(details)}
    ${buildCommoditySpecificExportDetails(details)}
  `.trim();
}

function buildTransportDetails(details: ExportDetails): string {
  const t = details.transportDetails;
  if (!t) return '';
  const euPlace = t.euPlaceOfDestinationDetail
    ? elem('com1:euPlaceOfDestinationDetail',
        optElem('com1:name', t.euPlaceOfDestinationDetail.name) +
        buildAddressSection(t.euPlaceOfDestinationDetail.address, 'com1:address') +
        optElem('com1:approvalNumber', t.euPlaceOfDestinationDetail.approvalNumber))
    : '';
  const seals = t.vesselHoldSeals
    ? elem('com1:vesselHoldSeals',
        optElem('com1:sealStartNumber', t.vesselHoldSeals.sealStartNumber) +
        optElem('com1:sealEndNumber', t.vesselHoldSeals.sealEndNumber))
    : '';
  const content =
    euPlace +
    optElem('com1:transportMode', t.transportMode) +
    optElem('com1:voyageOrFlightNumber', t.voyageOrFlightNumber) +
    optElem('com1:vesselName', t.vesselName) +
    optElem('com1:shippingCompany', t.shippingCompany) +
    (t.storeTransportTemperature
      ? optElem('com1:storeTransportTemperature', t.storeTransportTemperature.value, { unit: t.storeTransportTemperature.unit })
      : '') +
    optElem('com1:transferInformation', t.transferInformation) +
    seals;
  return elem('com1:transportDetails', content);
}

function buildDischargePorts(details: ExportDetails): string {
  const dp = details.dischargePorts;
  if (!dp) return '';
  const inner = dp.dischargePort?.map(p => optElem('com1:dischargePort', p)).join('') ??
    `<com1:removeExistingSet>${dp.removeExistingSet ?? false}</com1:removeExistingSet>`;
  return elem('com1:dischargePorts', inner);
}

function buildTransitCountries(details: ExportDetails): string {
  const tc = details.transitCountries;
  if (!tc) return '';
  const inner = tc.transitCountry?.map(c => optElem('com1:transitCountry', c)).join('') ??
    `<com1:removeExistingSet>${tc.removeExistingSet ?? false}</com1:removeExistingSet>`;
  return elem('com1:transitCountries', inner);
}

function buildLoadingPorts(details: ExportDetails): string {
  const lp = details.loadingPorts;
  if (!lp) return '';
  const inner = lp.loadingPort?.map(p => optElem('com1:loadingPort', p)).join('') ??
    `<com1:removeExistingSet>${lp.removeExistingSet ?? false}</com1:removeExistingSet>`;
  return elem('com1:loadingPorts', inner);
}

function buildImportPermits(details: ExportDetails): string {
  const ip = details.importPermits;
  if (!ip) return '';
  const inner = ip.importPermit?.map(p =>
    elem('com1:importPermit',
      `<com1:importPermitNumber>${p.importPermitNumber}</com1:importPermitNumber>` +
      optElem('com1:importPermitDate', p.importPermitDate))
  ).join('') ?? `<com1:removeExistingSet>${ip.removeExistingSet ?? false}</com1:removeExistingSet>`;
  return elem('com1:importPermits', inner);
}

function buildSewExport(details: ExportDetails): string {
  const sew = details.sew;
  if (!sew) return '';
  return elem('com1:sew',
    optElem('com1:customsAgentIndicator', sew.customsAgentIndicator) +
    optElem('com1:edn', sew.edn) +
    optElem('com1:currency', sew.currency) +
    optElem('com1:consigneeName', sew.consigneeName));
}

function buildExporterDeclaration(details: ExportDetails): string {
  const ed = details.exporterDeclaration;
  if (!ed) return '';
  const inner = optElem('com1:exporterDeclaration', ed.exporterDeclaration) +
    (ed.exporterDeclarationCode?.length
      ? ed.exporterDeclarationCode.map(c => optElem('com1:exporterDeclarationCode', c)).join('')
      : `<com1:removeExistingSet>${ed.removeExistingSet ?? false}</com1:removeExistingSet>`);
  return elem('com1:exporterDeclaration', inner);
}

function buildImaDetailsList(details: ExportDetails): string {
  const ima = details.imaDetailsList;
  if (!ima) return '';
  const inner = ima.imaDetails?.map(d =>
    elem('com1:imaDetails',
      `<com1:serialNumber>${d.serialNumber}</com1:serialNumber>` +
      (d.containerNumber ? optElem('com1:containerNumber', d.containerNumber) : optElem('com1:sealNumber', d.sealNumber)) +
      optElem('com1:invoiceDate', d.invoiceDate) +
      optElem('com1:invoiceNumber', d.invoiceNumber) +
      (d.grossWeight ? optElem('com1:grossWeight', d.grossWeight.value, { unit: d.grossWeight.unit }) : '') +
      (d.netWeight ? optElem('com1:netWeight', d.netWeight.value, { unit: d.netWeight.unit }) : '') +
      optElem('com1:productDescription', d.productDescription) +
      optElem('com1:quotaYear', d.quotaYear))
  ).join('') ?? `<com1:removeExistingSet>${ima.removeExistingSet ?? false}</com1:removeExistingSet>`;
  return elem('com1:imaDetailsList', inner);
}

function buildConsigneeDetails(details: ExportDetails): string {
  const cd = details.consigneeDetails;
  if (!cd) return '';
  return elem('com1:consigneeDetails',
    optElem('com:consigneeName', cd.consigneeName) +
    buildAddressSection(cd.consigneeAddress, 'com:consigneeAddress', 'com') +
    optElem('com:consigneePhoneNumber', cd.consigneePhoneNumber) +
    optElem('com:consigneeRepresentative', cd.consigneeRepresentative));
}

function buildMessageAcknowledgements(details: ExportDetails): string {
  const ma = details.messageAcknowledgements;
  if (!ma) return '';
  const inner = ma.messageId?.map(id => optElem('com:messageId', id)).join('') ??
    `<com:removeExistingSet>${ma.removeExistingSet ?? false}</com:removeExistingSet>`;
  return elem('com1:messageAcknowledgements', inner);
}

function buildAuthorisationDetails(details: ExportDetails): string {
  const ad = details.authorisationDetails;
  if (!ad) return '';
  return elem('com1:authorisationDetails',
    optElem('com1:authorisationDate', ad.authorisationDate) +
    optElem('com1:authorisingEstablishmentNumber', ad.authorisingEstablishmentNumber) +
    optElem('com1:comments', ad.comments));
}

function buildEuContactInformation(details: ExportDetails): string {
  const eu = details.euContactInformation;
  if (!eu) return '';
  return elem('com1:euContactInformation',
    `<com1:contactName>${eu.contactName}</com1:contactName>` +
    `<com1:contactPhone>${eu.contactPhone}</com1:contactPhone>` +
    optElem('com1:comments', eu.comments) +
    optElem('com1:testResultRequired', eu.testResultRequired));
}

function buildCommoditySpecificExportDetails(details: ExportDetails): string {
  if (details.fishExportDetails) {
    const f = details.fishExportDetails;
    const zones = f.catchingZones?.map(z => optElem('fis:catchingZone', z)).join('') ?? '';
    return elem('com1:fishExportDetails',
      (f.transportStorageMinimumTemperature
        ? optElem('fis:transportStorageMinimumTemperature', f.transportStorageMinimumTemperature.value, { unit: f.transportStorageMinimumTemperature.unit })
        : '') +
      elem('fis:catchingZones', zones));
  }
  if (details.woolExportDetails) {
    return elem('com1:woolExportDetails', optElem('wool:packDate', details.woolExportDetails.packDate));
  }
  if (details.skinsAndHidesExportDetails) {
    const s = details.skinsAndHidesExportDetails;
    return elem('com1:skinsAndHidesExportDetails',
      optElem('skin:loadingDate', s.loadingDate) +
      optElem('skin:loadingEstablishment', s.loadingEstablishment) +
      optElem('skin:packDate', s.packDate));
  }
  if (details.inedibleMeatExportDetails) {
    const i = details.inedibleMeatExportDetails;
    return elem('com1:inedibleMeatExportDetails',
      i.transportStorageMinimumTemperature
        ? optElem('ined:transportStorageMinimumTemperature', i.transportStorageMinimumTemperature.value, { unit: i.transportStorageMinimumTemperature.unit })
        : '');
  }
  // Horticulture — no commodity-specific section
  return '';
}
