import { Address, WeightWithUnit, YesNoFlag, AdditionalText, Attachment } from './common.types';

// --- Transport ---

export interface VesselHoldSeals {
  sealStartNumber?: string;
  sealEndNumber?: string;
}

export interface EuPlaceOfDestinationDetail {
  name?: string;
  address?: Address;
  approvalNumber?: string;
}

export interface TransportDetails {
  euPlaceOfDestinationDetail?: EuPlaceOfDestinationDetail;
  transportMode?: string;
  voyageOrFlightNumber?: string;
  vesselName?: string;
  shippingCompany?: string;
  storeTransportTemperature?: WeightWithUnit;
  transferInformation?: string;
  vesselHoldSeals?: VesselHoldSeals;
}

// --- Ports ---

export interface DischargePorts {
  dischargePort?: string[];
  removeExistingSet?: boolean;
}

export interface TransitCountries {
  transitCountry?: string[];
  removeExistingSet?: boolean;
}

export interface LoadingPorts {
  loadingPort?: string[];
  removeExistingSet?: boolean;
}

// --- Import Permits ---

export interface ImportPermit {
  importPermitNumber: string;
  importPermitDate?: string;
}

export interface ImportPermits {
  importPermit?: ImportPermit[];
  removeExistingSet?: boolean;
}

// --- SEW (Customs) ---

export interface SewExportDetails {
  customsAgentIndicator?: string;
  edn?: string;
  currency?: string;
  consigneeName?: string;
}

// --- Exporter Declaration ---

export interface ExporterDeclaration {
  exporterDeclaration?: string;
  exporterDeclarationCode?: string[];
  removeExistingSet?: boolean;
}

// --- IMA Details ---

export interface ImaDetails {
  serialNumber: string;
  containerNumber?: string;
  sealNumber?: string;
  invoiceDate?: string;
  invoiceNumber?: string;
  grossWeight?: WeightWithUnit;
  netWeight?: WeightWithUnit;
  productDescription?: string;
  quotaYear?: string;
}

export interface ImaDetailsList {
  imaDetails?: ImaDetails[];
  removeExistingSet?: boolean;
}

// --- Consignee ---

export interface ConsigneeDetails {
  consigneeName?: string;
  consigneeAddress?: Address;
  consigneePhoneNumber?: string;
  consigneeRepresentative?: string;
}

// --- Message Acknowledgements ---

export interface MessageAcknowledgements {
  removeExistingSet?: boolean;
  messageId?: string[];
}

// --- Authorisation ---

export interface AuthorisationDetails {
  authorisationDate?: string;
  authorisingEstablishmentNumber?: string;
  comments?: string;
}

// --- EU Contact ---

export interface EuContactInformation {
  contactName: string;
  contactPhone: string;
  comments?: string;
  testResultRequired?: YesNoFlag;
}

// --- Commodity-specific Export Details (mutually exclusive) ---

export interface FishExportDetails {
  transportStorageMinimumTemperature?: { value: string; unit: string };
  catchingZones?: string[];
}

export interface WoolExportDetails {
  packDate?: string;
}

export interface SkinsAndHidesExportDetails {
  loadingDate?: string;
  loadingEstablishment?: string;
  packDate?: string;
}

export interface InedibleMeatExportDetails {
  transportStorageMinimumTemperature?: { value: string; unit: string };
}

// --- Root Export Details ---

export interface ExportDetails {
  commodityType: string;
  priority?: string;
  departureDate?: string;
  transportDetails?: TransportDetails;
  destinationCity?: string;
  dischargePorts?: DischargePorts;
  destinationCountry: string;
  transitCountries?: TransitCountries;
  borderInspectionPort?: string;
  loadingPorts?: LoadingPorts;
  importPermits?: ImportPermits;
  sew?: SewExportDetails;
  ownerExporterId?: string;
  exporterDeclaration?: ExporterDeclaration;
  imaDetailsList?: ImaDetailsList;
  exporterReference?: string;
  consigneeDetails?: ConsigneeDetails;
  messageAcknowledgements?: MessageAcknowledgements;
  preferredWeightUnit?: string;
  tracesApprovalId?: string;
  productUseIndicator?: string;
  importedProductFlag?: YesNoFlag;
  manufacturedTreatedPackagedLabelledInAustralia?: YesNoFlag;
  legallyImported?: YesNoFlag;
  lotNumber?: string;
  storageEstablishmentNumber?: string;
  quotaYear?: string;
  quotaFlag?: YesNoFlag;
  quotaType?: string;
  shipStoresFlag?: YesNoFlag;
  exemptionCode?: string;
  authorisationFlag?: string;
  authorisationDetails?: AuthorisationDetails;
  euContactInformation?: EuContactInformation;

  // Commodity-specific — mutually exclusive, omit all for Horticulture
  fishExportDetails?: FishExportDetails;
  woolExportDetails?: WoolExportDetails;
  skinsAndHidesExportDetails?: SkinsAndHidesExportDetails;
  inedibleMeatExportDetails?: InedibleMeatExportDetails;
}
