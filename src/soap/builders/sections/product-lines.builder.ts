import { ProductLines, ProductLine, ProductDetails, ProductPackaging } from 'src/interfaces';
import { optElem, elem } from '../xml-utils';
import { buildAddress } from './address.builder';

export function buildProductLines(productLines: ProductLines | undefined): string {
  if (!productLines) return '';
  const lines = productLines.productLine.map(buildProductLine).join('');
  return lines + optElem('com1:retainProductLines', productLines.retainProductLines);
}

function buildProductLine(line: ProductLine): string {
  const inner =
    `<com1:lineNumber>${line.lineNumber}</com1:lineNumber>` +
    (line.removeEntry
      ? `<com1:removeEntry>${line.removeEntry}</com1:removeEntry>`
      : buildProductDetails(line.productDetails)) +
    buildContainers(line) +
    buildTreatments(line) +
    buildProductionProcesses(line) +
    buildSewProductLine(line) +
    optElem('com1:durabilityStartDate', line.durabilityStartDate) +
    optElem('com1:durabilityEndDate', line.durabilityEndDate) +
    optElem('com1:aheccCode', line.aheccCode) +
    optElem('com1:cnCode', line.cnCode) +
    optElem('com1:finalConsumerFlag', line.finalConsumerFlag) +
    optElem('com1:batchCode', line.batchCode) +
    buildAdditionalTexts(line) +
    buildProductSourceCountries(line) +
    buildProductLineAttachments(line) +
    optElem('com1:importAuthorityCode', line.importAuthorityCode) +
    buildCommoditySpecificProductLineDetails(line) +
    buildFreeTextEstablishments(line) +
    optElem('com1:natureOfCommodity', line.natureOfCommodity) +
    optElem('com1:euTreatmentType', line.euTreatmentType) +
    optElem('com1:quotaExporter', line.quotaExporter);
  return elem('com1:productLine', inner);
}

function buildProductDetails(pd: ProductDetails | undefined): string {
  if (!pd) return '';
  return elem('com1:productDetails',
    `<com1:productType>${pd.productType}</com1:productType>` +
    optElem('com1:category', pd.category) +
    `<com1:packType>${pd.packType}</com1:packType>` +
    `<com1:preservationType>${pd.preservationType}</com1:preservationType>` +
    optElem('com1:cutType', pd.cutType) +
    optElem('com1:suppCode', pd.suppCode) +
    buildPackaging('com1:outerProductPackaging', pd.outerProductPackaging) +
    buildPackaging('com1:intermediateProductPackaging', pd.intermediateProductPackaging) +
    buildPackaging('com1:innerProductPackaging', pd.innerProductPackaging) +
    (pd.netMetricWeight ? optElem('com1:netMetricWeight', pd.netMetricWeight.value, { unit: pd.netMetricWeight.unit }) : '') +
    (pd.netImperialWeight ? optElem('com1:netImperialWeight', pd.netImperialWeight.value, { unit: pd.netImperialWeight.unit }) : '') +
    optElem('com1:manualCertificateProductDescription', pd.manualCertificateProductDescription) +
    optElem('com1:additionalDescription', pd.additionalDescription) +
    optElem('com1:farmCode', pd.farmCode) +
    optElem('com1:farmType', pd.farmType));
}

function buildPackaging(tag: string, pkg: ProductPackaging | undefined): string {
  if (!pkg) return '';
  return elem(tag,
    optElem('com1:quantity', pkg.quantity.value, { packageType: pkg.quantity.packageType }) +
    (pkg.unitAmount ? optElem('com1:unitAmount', pkg.unitAmount.value, { unit: pkg.unitAmount.unit }) : '') +
    optElem('com1:packageMeasureAccuracy', pkg.packageMeasureAccuracy) +
    optElem('com1:shippingMarks', pkg.shippingMarks));
}

function buildContainers(line: ProductLine): string {
  const c = line.containers;
  if (!c) return '';
  if (c.removeExistingSet) return elem('com1:containers', '<com1:removeExistingSet>true</com1:removeExistingSet>');
  const containers = c.container?.map(con => {
    const seals = con.containerSeals?.containerSeal.map(s =>
      elem('com1:containerSeal',
        optElem('com1:sealNumber', s.sealNumber) +
        optElem('com1:sealStartNumber', s.sealStartNumber) +
        optElem('com1:sealEndNumber', s.sealEndNumber))
    ).join('') ?? '';
    return elem('com1:container',
      `<com1:containerNumber>${con.containerNumber}</com1:containerNumber>` +
      elem('com1:containerSeals', seals));
  }).join('') ?? '';
  return elem('com1:containers', containers);
}

function buildTreatments(line: ProductLine): string {
  const t = line.treatments;
  if (!t) return '';
  const types = t.treatmentType?.map(tt =>
    elem('com1:treatmentType',
      `<com1:treatmentCode>${tt.treatmentCode}</com1:treatmentCode>` +
      `<com1:treatmentStartDate>${tt.treatmentStartDate}</com1:treatmentStartDate>` +
      optElem('com1:treatmentEndDate', tt.treatmentEndDate) +
      `<com1:treatmentInformation>${tt.treatmentInformation}</com1:treatmentInformation>`)
  ).join('') ?? '';
  const removeSet = t.removeExistingSet !== undefined
    ? `<com1:removeExistingSet>${t.removeExistingSet}</com1:removeExistingSet>`
    : '';
  return elem('com1:treatments', types + removeSet);
}

function buildProductionProcesses(line: ProductLine): string {
  const pp = line.productionProcesses;
  if (!pp) return '';
  if (pp.removeExistingSet) return elem('com1:productionProcesses', '<com1:removeExistingSet>true</com1:removeExistingSet>');
  const processes = pp.productionProcess?.map(p =>
    elem('com1:productionProcess',
      optElem('com1:processingStartDate', p.processingStartDate) +
      optElem('com1:processingEndDate', p.processingEndDate) +
      `<com1:establishmentIndicator>${p.establishmentIndicator}</com1:establishmentIndicator>` +
      `<com1:processingEstablishmentNumber>${p.processingEstablishmentNumber}</com1:processingEstablishmentNumber>` +
      optElem('com1:removeEntry', p.removeEntry))
  ).join('') ?? '';
  return elem('com1:productionProcesses', processes);
}

function buildSewProductLine(line: ProductLine): string {
  const sew = line.sew;
  if (!sew) return '';
  return elem('com1:sew',
    (sew.netCustomsWeight ? optElem('com1:netCustomsWeight', sew.netCustomsWeight.value, { unit: sew.netCustomsWeight.unit }) : '') +
    (sew.grossMetricWeight ? optElem('com1:grossMetricWeight', sew.grossMetricWeight.value, { unit: sew.grossMetricWeight.unit }) : '') +
    optElem('com1:fobAmount', sew.fobAmount) +
    optElem('com1:productSourceState', sew.productSourceState) +
    optElem('com1:relatedPermitType', sew.relatedPermitType) +
    optElem('com1:relatedPermitNumber', sew.relatedPermitNumber) +
    optElem('com1:relatedPermitDate', sew.relatedPermitDate));
}

function buildAdditionalTexts(line: ProductLine): string {
  const at = line.additionalTexts;
  if (!at) return '';
  const texts = at.additionalText.map(t =>
    elem('com1:additionalText',
      `<com1:code>${t.code}</com1:code>` +
      t.text.map(txt => optElem('com1:text', txt)).join(''))
  ).join('');
  return elem('com1:additionalTexts', texts);
}

function buildProductSourceCountries(line: ProductLine): string {
  const psc = line.productSourceCountries;
  if (!psc) return '';
  const inner = psc.productSourceCountry?.map(c => optElem('com1:productSourceCountry', c)).join('') ??
    `<com1:removeExistingSet>${psc.removeExistingSet ?? false}</com1:removeExistingSet>`;
  return elem('com1:productSourceCountries', inner);
}

function buildProductLineAttachments(line: ProductLine): string {
  const att = line.attachments;
  if (!att) return '';
  const attachments = att.attachment.map(a =>
    elem('com:attachment',
      `<com:name>${a.name}</com:name>` +
      (a.removeEntry !== undefined ? optElem('com:removeEntry', String(a.removeEntry)) : '') +
      optElem('com:attachmentType', a.attachmentType) +
      `<com:description>${a.description}</com:description>` +
      `<com:mimeType>${a.mimeType}</com:mimeType>` +
      optElem('com:data', a.data))
  ).join('');
  return elem('com1:attachments', attachments);
}

function buildCommoditySpecificProductLineDetails(line: ProductLine): string {
  if (line.fishProductLineDetails) {
    const f = line.fishProductLineDetails;
    return elem('com1:fishProductLineDetails',
      optElem('fis:catchStartDate', f.catchStartDate) +
      optElem('fis:catchEndDate', f.catchEndDate) +
      optElem('fis:fishWaterIndicator', f.fishWaterIndicator));
  }
  if (line.skinsAndHidesProductLineDetails) {
    return elem('com1:skinsAndHidesProductLineDetails',
      optElem('skin:saltingDate', line.skinsAndHidesProductLineDetails.saltingDate));
  }
  // Horticulture — no commodity-specific product line section
  return '';
}

function buildFreeTextEstablishments(line: ProductLine): string {
  const fte = line.freeTextEstablishments;
  if (!fte) return '';
  if (fte.removeExistingSet) return elem('com1:freeTextEstablishments', '<com1:removeExistingSet>true</com1:removeExistingSet>');
  const establishments = fte.freeTextEstablishment?.map(e =>
    elem('com1:freeTextEstablishment',
      `<com1:startDate>${e.startDate}</com1:startDate>` +
      `<com1:endDate>${e.endDate}</com1:endDate>` +
      `<com1:establishmentIndicator>${e.establishmentIndicator}</com1:establishmentIndicator>` +
      `<com1:establishmentName>${e.establishmentName}</com1:establishmentName>` +
      (e.address ? elem('com1:address', buildAddress(e.address)) : '') +
      optElem('com1:phoneNumber', e.phoneNumber) +
      optElem('com1:partyIdentification', e.partyIdentification) +
      optElem('com1:removeEntry', e.removeEntry))
  ).join('') ?? '';
  return elem('com1:freeTextEstablishments', establishments);
}
