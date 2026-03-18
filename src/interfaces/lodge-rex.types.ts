import { Address, AdditionalText, Attachment } from './common.types';
import { ExportDetails } from './export-details.types';
import { CertificateDetails } from './certificate-details.types';
import { ProductLines } from './product-line.types';

// --- Identification (AMEND only — omit for ORDER and LODGE) ---

export interface Identification {
  rexNumber: string;
  lastAmendDateTime: string;
}

// --- Manufacturers ---

export interface ManufacturerDetails {
  name: string;
  address: Address;
}

export interface Manufacturer {
  lineNumbers: { lineNumber: string[] };
  manufacturerDetails: ManufacturerDetails;
}

export interface Manufacturers {
  manufacturer: Manufacturer[];
}

// --- EU Transit ---

export interface PersonResponsible {
  address?: Address;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface PlaceOfDestinationDetails {
  name?: string;
  address?: Address;
  phoneNumber?: string;
  approvalNumber?: string;
  transitLocationType?: string;
}

export interface EuTransit {
  personResponsible?: PersonResponsible;
  placeOfDestinationDetails?: PlaceOfDestinationDetails;
}

// --- SOAP Header ---

export interface SoapHeader {
  vendorToken: string;
  clientGroupToken: string;
  clientToken: string;
  username: string;
  password: string;
}

// --- Payload Type ---

export type PayloadType = 'ORDER' | 'LODGE' | 'AMEND';

// --- Root LodgeRex Payload ---

export interface LodgeRexPayload {
  payloadType: PayloadType;

  // Present only on AMEND — omit for ORDER and LODGE
  identification?: Identification;

  exportDetails?: ExportDetails;
  certificateDetails?: CertificateDetails;
  productLines?: ProductLines;
  manufacturers?: Manufacturers;
  attachments?: { attachment: Attachment[] };
  additionalTexts?: { additionalText: AdditionalText[] };
  euTransit?: EuTransit;
}

// --- SOAP Response Types ---

export interface LodgeRexSuccessResponse {
  rexNumber: string;
  lastAmendmentTimestamp: string;
  status?: string;
  messages?: ResponseMessage[];
}

export interface ResponseMessage {
  messageId: string;
  messageText: string;
  messageType: 'INFO' | 'WARNING' | 'ERROR';
}

export interface LodgeRexErrorResponse {
  faultCode: string;
  faultMessage: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  errorCode: string;
  errorMessage: string;
  fieldPath?: string;
}
