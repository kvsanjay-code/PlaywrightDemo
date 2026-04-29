// --- ReleaseRexToPrinter Payload ---
// Service: LodgeRexSoap_1.0 / lod:ReleaseRexToPrinter
// Releases an authorised REX to the printer.

export interface ReleaseRexToPrintPayload {
  rexNumber:         string;
  lastAmendDateTime: string;
}
