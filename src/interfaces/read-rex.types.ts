// --- ReadRex Payload ---
// Service: ReadRexSoap_1.0 / read:ReadRex
// Used to fetch the latest REX details including lastAmendmentTimestamp
// before sending AMEND or REPLACE requests

export interface ReadRexPayload {
  rexNumber: string;
}

// --- ReadRex Response ---
// Returns full REX details with the latest amendment timestamp

export interface ReadRexResponse {
  rexNumber: string;
  lastAmendmentTimestamp: string;
  status?: string;
  // Full REX details returned — extend as response fields are confirmed
  [key: string]: unknown;
}
