import { CertificateDetails, CertificateEntry, PlantAdditionalDeclaration } from 'src/interfaces';
import { optElem, elem } from '../xml-utils';

export function buildCertificateDetails(details: CertificateDetails | undefined): string {
  if (!details) return '';
  return buildPrintControls(details) + buildCertificates(details);
}

function buildPrintControls(details: CertificateDetails): string {
  const pc = details.certificatePrintControls;
  if (!pc) return '';
  const regionOrGroup = pc.certificatePrintRegion
    ? optElem('com1:certificatePrintRegion', pc.certificatePrintRegion)
    : optElem('com1:certificateRequiredClientGroup', pc.certificateRequiredClientGroup);
  return elem('com1:certificatePrintControls',
    optElem('com1:certificatePrintIndicator', pc.certificatePrintIndicator) +
    regionOrGroup +
    optElem('com1:separateBy', pc.separateBy));
}

function buildCertificates(details: CertificateDetails): string {
  const certs = details.certificates;
  if (!certs) return '';
  if (certs.removeExistingSet) {
    return elem('com1:certificates', '<com1:removeExistingSet>true</com1:removeExistingSet>');
  }
  const certEntries = certs.certificate?.map(c => elem('com1:certificate', buildCertEntry(c))).join('') ?? '';
  const primaryEntries = certs.primaryCertificate?.map(c => elem('com1:primaryCertificate', buildCertEntry(c))).join('') ?? '';
  const extraEntries = certs.extraCertificate?.map(c => elem('com1:extraCertificate', buildCertEntry(c))).join('') ?? '';
  return elem('com1:certificates', certEntries + primaryEntries + extraEntries);
}

function buildPlantAdditionalDeclarations(declarations: PlantAdditionalDeclaration[]): string {
  const items = declarations.map(d =>
    elem('plan:plantAdditionalDeclaration',
      `<plan:lineNumber>${d.lineNumber}</plan:lineNumber>` +
      d.declarationText.map(t => `<plan:declarationText>${t}</plan:declarationText>`).join(''))
  ).join('');
  return elem('com1:plantAdditionalDeclarations', items);
}

function buildCertEntry(c: CertificateEntry): string {
  if (c.removeEntry) return optElem('com1:removeEntry', c.removeEntry);
  const lineNumbers = c.lineNumbers?.lineNumber.map(n => optElem('com1:lineNumber', n)).join('') ?? '';
  const plantDeclarations = c.plantAdditionalDeclarations
    ? buildPlantAdditionalDeclarations(c.plantAdditionalDeclarations.plantAdditionalDeclaration)
    : '';
  const printDetails = c.certificatePrintDetails
    ? elem('com1:certificatePrintDetails',
        c.certificatePrintDetails.certificatePrintRegion
          ? optElem('com1:certificatePrintRegion', c.certificatePrintDetails.certificatePrintRegion)
          : optElem('com1:certificateRequiredClientGroup', c.certificatePrintDetails.certificateRequiredClientGroup))
    : '';
  return elem('com1:lineNumbers', lineNumbers) +
    elem('com1:certificateDetails',
      `<com1:certificateTemplate>${c.certificateDetails.certificateTemplate}</com1:certificateTemplate>` +
      optElem('com1:certificateEndorsement', c.certificateDetails.certificateEndorsement)) +
    plantDeclarations +
    printDetails;
}
