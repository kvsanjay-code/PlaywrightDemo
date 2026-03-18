import { Attachment, AdditionalText } from './common.types';
import { ExportDetails } from './export-details.types';
import { CertificateDetails } from './certificate-details.types';
import { ProductLines } from './product-line.types';
import { Identification, Manufacturers, EuTransit, LodgeRexSuccessResponse } from './lodge-rex.types';

// --- Root OrderRex Payload ---
// ORDER uses the same field types as LodgeRex but:
//   - exportDetails and productLines are MANDATORY
//   - identification is optional
//   - uses OrderRexSoap_1.0 namespace / ord:OrderRex root element

export interface OrderRexPayload {
  // Optional — present if amending an order
  identification?: Identification;

  // MANDATORY for ORDER
  exportDetails: ExportDetails;
  productLines: ProductLines;

  // Optional
  certificateDetails?: CertificateDetails;
  manufacturers?: Manufacturers;
  attachments?: { attachment: Attachment[] };
  additionalTexts?: { additionalText: AdditionalText[] };
  euTransit?: EuTransit;
}

// --- ORDER Response ---
// On success: returns REXNumber + lastAmendmentTimestamp (same as LODGE)

export type OrderRexResponse = LodgeRexSuccessResponse;
