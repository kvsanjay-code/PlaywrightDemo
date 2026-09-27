import { Address } from 'src/interfaces';
import { optElem, elem } from '../xml-utils';

export function buildAddress(addr: Address | undefined, prefix = 'com'): string {
  if (!addr) return '';
  const street = addr.streetLine?.length
    ? `<${prefix}:streetAddress>` +
      addr.streetLine.map(line => `<${prefix}:streetLine>${line}</${prefix}:streetLine>`).join('') +
      `</${prefix}:streetAddress>`
    : '';
  return street +
    optElem(`${prefix}:city`, addr.city) +
    optElem(`${prefix}:state`, addr.state) +
    optElem(`${prefix}:country`, addr.country) +
    optElem(`${prefix}:postalCode`, addr.postalCode);
}

export function buildAddressSection(addr: Address | undefined, tag: string, prefix = 'com'): string {
  if (!addr) return '';
  return elem(tag, buildAddress(addr, prefix));
}
