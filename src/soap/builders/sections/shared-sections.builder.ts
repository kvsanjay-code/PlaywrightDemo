// Builds attachments, additionalTexts and euTransit — shared across all payload types

import { Attachment, AdditionalText, EuTransit } from 'src/interfaces';
import { optElem, elem } from '../xml-utils';
import { buildAddress } from './address.builder';

export function buildAttachments(attachments: { attachment: Attachment[] } | undefined, wrapTag: string): string {
  if (!attachments) return '';
  const items = attachments.attachment.map(a =>
    elem('com:attachment',
      `<com:name>${a.name}</com:name>` +
      (a.removeEntry !== undefined ? optElem('com:removeEntry', String(a.removeEntry)) : '') +
      optElem('com:attachmentType', a.attachmentType) +
      `<com:description>${a.description}</com:description>` +
      `<com:mimeType>${a.mimeType}</com:mimeType>` +
      optElem('com:data', a.data))
  ).join('');
  return elem(wrapTag, items);
}

export function buildAdditionalTexts(additionalTexts: { additionalText: AdditionalText[] } | undefined, wrapTag: string): string {
  if (!additionalTexts) return '';
  const items = additionalTexts.additionalText.map(t =>
    elem('com1:additionalText',
      `<com1:code>${t.code}</com1:code>` +
      t.text.map(txt => optElem('com1:text', txt)).join(''))
  ).join('');
  return elem(wrapTag, items);
}

export function buildEuTransit(euTransit: EuTransit | undefined, wrapTag: string): string {
  if (!euTransit) return '';
  const personResponsible = euTransit.personResponsible
    ? elem('com1:personResponsible',
        elem('com1:address', buildAddress(euTransit.personResponsible.address)) +
        optElem('com1:firstName', euTransit.personResponsible.firstName) +
        optElem('com1:lastName', euTransit.personResponsible.lastName) +
        optElem('com1:phoneNumber', euTransit.personResponsible.phoneNumber))
    : '';
  const placeOfDestination = euTransit.placeOfDestinationDetails
    ? elem('com1:placeOfDestinationDetails',
        optElem('com1:name', euTransit.placeOfDestinationDetails.name) +
        elem('com1:address', buildAddress(euTransit.placeOfDestinationDetails.address)) +
        optElem('com1:phoneNumber', euTransit.placeOfDestinationDetails.phoneNumber) +
        optElem('com1:approvalNumber', euTransit.placeOfDestinationDetails.approvalNumber) +
        optElem('com1:transitLocationType', euTransit.placeOfDestinationDetails.transitLocationType))
    : '';
  return elem(wrapTag, personResponsible + placeOfDestination);
}
