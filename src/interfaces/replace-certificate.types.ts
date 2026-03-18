import { Attachment, AdditionalText } from './common.types';
import { ExportDetails } from './export-details.types';
import { CertificateDetails } from './certificate-details.types';
import { ProductLines } from './product-line.types';
import { Manufacturers, EuTransit, LodgeRexSuccessResponse } from './lodge-rex.types';

// --- Identification (MANDATORY for REPLACE — rexNumber + lastAmendDateTime from LODGE response) ---

export interface ReplaceIdentification {
  rexNumber: string;
  lastAmendDateTime: string;
}

// --- Rex Details (wraps all sections in REPLACE) ---

export interface RexDetails {
  identification: ReplaceIdentification;              // mandatory
  exportDetails?: ExportDetails;                      // reuses LodgeRex type
  certificateDetails?: CertificateDetails;            // reuses LodgeRex type
  productLines?: ProductLines;                        // reuses LodgeRex type
  manufacturers?: Manufacturers;                      // reuses LodgeRex type
  attachments?: { attachment: Attachment[] };
  additionalTexts?: { additionalText: AdditionalText[] };
  newProductLinesOnly?: string;                       // REPLACE-only field
  euTransit?: EuTransit;                              // reuses LodgeRex type
}

// --- Root ReplaceCertificate Payload ---

export interface ReplaceCertificatePayload {
  reason: string;                                     // mandatory — reason for replacement
  rexDetails: RexDetails;
}

// --- REPLACE Response (reuses same structure as LODGE success) ---

export type ReplaceCertificateResponse = LodgeRexSuccessResponse;
