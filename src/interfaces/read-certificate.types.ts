// --- ReadCertificate Payload ---
// Service: ReadCertificateSoap_1.0 / read:ReadCertificate
// Used to fetch certificate details for a given REX number

export interface ReadCertificatePayload {
  rexNumber: string;
}
