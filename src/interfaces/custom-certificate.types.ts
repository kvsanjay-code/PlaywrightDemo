export interface CustomCertificateConsigneeAddress {
  streetLine?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface CustomCertificateConsigneeDetails {
  consigneeName: string;
  consigneeAddress: CustomCertificateConsigneeAddress;
  consigneeReferenceNumber?: string;
}

export interface CustomCertificateTransportDetails {
  departureDate: string;
  dischargePort: string;
  destinationCity: string;
  destinationCountry: string;
  voyageOrFlightNumber?: string;
  vesselName?: string;
}

export interface CusCertPrintDetails {
  certificatePrintIndicator: string;
  // CHOICE: provide one or the other
  certificatePrintRegion?: string;
  certificateRequiredClientGroup?: string;
}

export interface CustomCertificateImportPermit {
  importPermitNumber: string;
  importPermitDate?: string;
}

export interface CustomCertificateAdditionalDetails {
  exporterReference: string;
  certificatePrintDetails: CusCertPrintDetails;
  importPermits?: CustomCertificateImportPermit[];
}

export interface CusContainerSeal {
  // CHOICE: sealNumber OR sealStartNumber+sealEndNumber
  sealNumber?: string;
  sealStartNumber?: string;
  sealEndNumber?: string;
}

export interface CustomCertificateContainer {
  containerNumber: string;
  containerSeals?: CusContainerSeal[];
}

export interface CustomCertificateProductDetails {
  netQuantity: { value: string; unit: string };
  outerPackageQuantity: { value: string; packageType: string };
}

export interface CustomCertificateProductLine {
  requestLineNumber: string;
  rexNumber: string;
  rexProductLineNumber: string;
  certificateLineNumber: string;
  productDetails: CustomCertificateProductDetails;
  containers?: CustomCertificateContainer[];
}

export interface LodgeCustomCertificatePayload {
  consigneeDetails: CustomCertificateConsigneeDetails;
  transportDetails: CustomCertificateTransportDetails;
  additionalDetails: CustomCertificateAdditionalDetails;
  productLines: CustomCertificateProductLine[];
  exporterDeclarationCode: string;
}
