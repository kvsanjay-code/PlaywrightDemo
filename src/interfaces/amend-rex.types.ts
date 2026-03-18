import { Attachment, AdditionalText } from './common.types';
import { ExportDetails } from './export-details.types';
import { CertificateDetails } from './certificate-details.types';
import { ProductLines } from './product-line.types';
import { Identification, Manufacturers, EuTransit, LodgeRexSuccessResponse } from './lodge-rex.types';

// --- Root AmendRex Payload ---
// Key differences from LodgeRex:
//   - identification is MANDATORY (rexNumber + lastAmendDateTime from successful LODGE)
//   - submitAmendmentRequest and amendmentReason are AMEND-specific fields
//   - Uses AmendRexSoap_1.0 namespace / amen:AmendRex root element

export interface AmendRexPayload {
  // MANDATORY — rexNumber + lastAmendDateTime returned from successful LODGE
  identification: Identification;

  // Optional — include only the sections/fields being amended
  exportDetails?: ExportDetails;
  certificateDetails?: CertificateDetails;
  productLines?: ProductLines;
  manufacturers?: Manufacturers;
  attachments?: { attachment: Attachment[] };
  additionalTexts?: { additionalText: AdditionalText[] };
  euTransit?: EuTransit;

  // AMEND-specific fields
  submitAmendmentRequest?: string;
  amendmentReason?: string;
}

// --- AMEND Response ---
// On success: returns REXNumber + lastAmendmentTimestamp (same as LODGE)

export type AmendRexResponse = LodgeRexSuccessResponse;
