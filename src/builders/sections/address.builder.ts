import { Address } from '../../interfaces';
import { optElem, elem } from '../xml-utils';

export function buildAddress(addr: Address | undefined, prefix = 'com'): string {
  if (!addr) return '';
  const street = addr.streetLine
    ? `<${prefix}:streetAddress><${prefix}:streetLine>${addr.streetLine}</${prefix}:streetLine></${prefix}:streetAddress>`
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
