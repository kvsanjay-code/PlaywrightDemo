/**
 * eu-transit-overrides.ts
 *
 * Override types for the optional EU-specific sections of REX payloads.
 * Consumed by the corresponding build* helpers in rex-defaults.ts.
 */

export interface EuTransitOverrides {
  personFirstName?:     string;
  personLastName?:      string;
  personPhone?:         string;
  personAddress?:       { streetLine: string; city: string; country: string; postalCode: string };
  placeName?:           string;
  placeAddress?:        { streetLine: string; city: string; country: string; postalCode: string };
  placePhone?:          string;
  approvalNumber?:      string;
  transitLocationType?: string;
}

export interface EuPlaceOfDestinationDetailOverrides {
  name?:           string;
  address?:        { streetLine: string; city: string; country: string; postalCode: string };
  approvalNumber?: string;
}
