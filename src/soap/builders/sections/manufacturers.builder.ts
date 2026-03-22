import { Manufacturers } from '../../interfaces';
import { elem } from '../xml-utils';
import { buildAddress } from './address.builder';

export function buildManufacturers(manufacturers: Manufacturers | undefined): string {
  if (!manufacturers) return '';
  return manufacturers.manufacturer.map(m => {
    const lineNumbers = m.lineNumbers.lineNumber.map(n => `<com1:lineNumber>${n}</com1:lineNumber>`).join('');
    return elem('com1:manufacturer',
      elem('com1:lineNumbers', lineNumbers) +
      elem('com1:manufacturerDetails',
        `<com1:name>${m.manufacturerDetails.name}</com1:name>` +
        elem('com1:address', buildAddress(m.manufacturerDetails.address))));
  }).join('');
}
