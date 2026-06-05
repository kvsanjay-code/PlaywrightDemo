// Certificate section interfaces

export enum PrintIndicator {
  Auto   = 'A',
  Manual = 'M',
  None   = 'N',
}

export type CertificatePrintIndicator = PrintIndicator;

export interface CertificatePrintDetails {
  certificatePrintRegion?: string;
  certificateRequiredClientGroup?: string;
}

export interface CertificatePrintControls {
  certificatePrintIndicator?: CertificatePrintIndicator;
  certificatePrintRegion?: string;
  certificateRequiredClientGroup?: string;
  separateBy?: string;
}

export interface PlantAdditionalDeclaration {
  lineNumber:      string;
  declarationText: string[];   // 0 to 5 repetitions
}

export interface CertificateEntry {
  removeEntry?: string;
  lineNumbers?: { lineNumber: string[] };
  certificateDetails: {
    certificateTemplate: string;
    certificateEndorsement?: string;
  };
  plantAdditionalDeclarations?: { plantAdditionalDeclaration: PlantAdditionalDeclaration[] };
  certificatePrintDetails?: CertificatePrintDetails;
}

export interface Certificates {
  certificate?: CertificateEntry[];
  primaryCertificate?: CertificateEntry[];
  extraCertificate?: CertificateEntry[];
  removeExistingSet?: boolean;
}

export interface CertificateDetails {
  certificatePrintControls?: CertificatePrintControls;
  certificates?: Certificates;
}
