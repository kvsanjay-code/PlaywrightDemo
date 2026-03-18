import { Address, WeightWithUnit, QuantityWithPackageType, UnitAmount, YesNoFlag, AdditionalText, Attachment, PackageMeasureAccuracy } from './common.types';

// --- Packaging ---

export interface ProductPackaging {
  quantity: QuantityWithPackageType;
  unitAmount?: UnitAmount;
  packageMeasureAccuracy?: PackageMeasureAccuracy;
  shippingMarks?: string;
}

// --- Product Details ---

export interface ProductDetails {
  productType: string;
  category?: string;
  packType: string;
  preservationType: string;
  cutType?: string;
  suppCode?: string;
  outerProductPackaging?: ProductPackaging;
  intermediateProductPackaging?: ProductPackaging;
  innerProductPackaging?: ProductPackaging;
  netMetricWeight?: WeightWithUnit;
  netImperialWeight?: WeightWithUnit;
  manualCertificateProductDescription?: string;
  additionalDescription?: string;
  farmCode?: string;
  farmType?: string;
}

// --- Containers ---

export interface ContainerSeal {
  sealNumber?: string;
  sealStartNumber?: string;
  sealEndNumber?: string;
}

export interface Container {
  containerNumber: string;
  containerSeals?: { containerSeal: ContainerSeal[] };
}

export interface Containers {
  container?: Container[];
  removeExistingSet?: boolean;
}

// --- Treatments ---

export interface TreatmentType {
  treatmentCode: string;
  treatmentStartDate: string;
  treatmentEndDate?: string;
  treatmentInformation: string;
}

export interface Treatments {
  treatmentType?: TreatmentType[];
  removeExistingSet?: boolean;
}

// --- Production Processes ---

export interface ProductionProcess {
  processingStartDate?: string;
  processingEndDate?: string;
  establishmentIndicator: string;
  processingEstablishmentNumber: string;
  removeEntry?: string;
}

export interface ProductionProcesses {
  productionProcess?: ProductionProcess[];
  removeExistingSet?: boolean;
}

// --- SEW (Product Line) ---

export interface SewProductLine {
  netCustomsWeight?: WeightWithUnit;
  grossMetricWeight?: WeightWithUnit;
  fobAmount?: string;
  productSourceState?: string;
  relatedPermitType?: string;
  relatedPermitNumber?: string;
  relatedPermitDate?: string;
}

// --- Free Text Establishments ---

export interface FreeTextEstablishment {
  startDate: string;
  endDate: string;
  establishmentIndicator: string;
  establishmentName: string;
  address?: Address;
  phoneNumber?: string;
  partyIdentification?: string;
  removeEntry?: string;
}

export interface FreeTextEstablishments {
  freeTextEstablishment?: FreeTextEstablishment[];
  removeExistingSet?: boolean;
}

// --- Commodity-specific Product Line Details ---

export interface FishProductLineDetails {
  catchStartDate?: string;
  catchEndDate?: string;
  fishWaterIndicator?: string;
  fishEstablishments?: {
    freeTextEstablishment?: FreeTextEstablishment[];
    harvestArea?: object[];
  };
}

export interface SkinsAndHidesProductLineDetails {
  saltingDate?: string;
}

// --- Product Source Countries ---

export interface ProductSourceCountries {
  productSourceCountry?: string[];
  removeExistingSet?: boolean;
}

// --- Root Product Line ---

export interface ProductLine {
  lineNumber: string;
  removeEntry?: boolean;
  productDetails?: ProductDetails;
  containers?: Containers;
  treatments?: Treatments;
  productionProcesses?: ProductionProcesses;
  sew?: SewProductLine;
  durabilityStartDate?: string;
  durabilityEndDate?: string;
  aheccCode?: string;
  cnCode?: string;
  finalConsumerFlag?: YesNoFlag;
  batchCode?: string;
  additionalTexts?: { additionalText: AdditionalText[] };
  productSourceCountries?: ProductSourceCountries;
  attachments?: { attachment: Attachment[] };
  importAuthorityCode?: string;

  // Commodity-specific — mutually exclusive, omit for Horticulture
  fishProductLineDetails?: FishProductLineDetails;
  skinsAndHidesProductLineDetails?: SkinsAndHidesProductLineDetails;

  freeTextEstablishments?: FreeTextEstablishments;
  natureOfCommodity?: string;
  euTreatmentType?: string;
  quotaExporter?: string;
}

export interface ProductLines {
  productLine: ProductLine[];
  retainProductLines?: string;
}
