import { Identification } from './lodge-rex.types';

// --- CancelRex Payload ---
// Service: RexSubmissionService / CancelRexSoap_1.0 / can:CancelRex
// Cancels a REX submission.

export interface CancelRexPayload {
  identification: Identification;
  reason?: string;   // optional — reason for cancellation
}
