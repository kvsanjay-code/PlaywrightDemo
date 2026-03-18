// Shared types used across multiple payload sections

export interface Address {
  streetLine?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface WeightWithUnit {
  value: string;
  unit: string;
}

export interface QuantityWithPackageType {
  value: string;
  packageType: string;
}

export interface UnitAmount {
  value: string;
  unit: string;
}

export type YesNoFlag = 'Y' | 'N';

export type PackageMeasureAccuracy = 'E' | 'A';

export interface Attachment {
  name: string;
  removeEntry?: boolean;
  attachmentType?: string;
  description: string;
  mimeType: string;
  data?: string;
}

export interface AdditionalText {
  code: string;
  text: string[];
}
