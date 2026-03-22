import * as dotenv from 'dotenv';
import * as path from 'path';

export type Environment = 'sit' | 'sit2' | 'vnd';

export interface EnvironmentConfig {
  env: Environment;

  // SOAP credentials
  vendorToken: string;
  clientGroupToken: string;
  clientToken: string;
  soapUsername: string;
  soapPassword: string;

  // SOAP service URLs
  rexSubmissionServiceUrl: string;
  rexCertificateServiceUrl: string;
  readRexServiceUrl: string;

  // Staff portal
  staffPortalUrl: string;
  staffUsername: string;
  staffPassword: string;

  // Payload identifiers
  ownerExporterId:                   string;
  certificateRequiredClientGroup:    string;
}

function loadConfig(): EnvironmentConfig {
  const env = (process.env.ENV || 'sit').toLowerCase() as Environment;

  const envFile = path.resolve(process.cwd(), `.env.${env}`);
  dotenv.config({ path: envFile });

  return {
    env,
    vendorToken:              requireEnv('VENDOR_TOKEN'),
    clientGroupToken:         requireEnv('CLIENT_GROUP_TOKEN'),
    clientToken:              requireEnv('CLIENT_TOKEN'),
    soapUsername:             requireEnv('SOAP_USERNAME'),
    soapPassword:             requireEnv('SOAP_PASSWORD'),
    rexSubmissionServiceUrl:  requireEnv('REX_SUBMISSION_SERVICE_URL'),
    rexCertificateServiceUrl: requireEnv('REX_CERTIFICATE_SERVICE_URL'),
    readRexServiceUrl:        requireEnv('READ_REX_SERVICE_URL'),
    staffPortalUrl:                    requireEnv('STAFF_PORTAL_URL'),
    staffUsername:                     requireEnv('STAFF_USERNAME'),
    staffPassword:                     requireEnv('STAFF_PASSWORD'),
    ownerExporterId:                   requireEnv('OWNER_EXPORTER_ID'),
    certificateRequiredClientGroup:    requireEnv('CERTIFICATE_REQUIRED_CLIENT_GROUP'),
  };
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = loadConfig();
