import { SoapHeader } from 'src/interfaces';

// Namespace declarations added to every SOAP envelope
export const SOAP_HEADER_NAMESPACES = [
  'xmlns:nexauth="http://agriculture.gov.au/header/auth"',
  'xmlns:wsse="http://docs.oasis-open.xsd"',
].join(' ');

export function buildSoapHeader(header: SoapHeader): string {
  return `
    <nexauth:authTokens xmlns:nexauth="http://agriculture.gov.au/header/auth">
      <vendorToken>${header.vendorToken}</vendorToken>
      <clientGroupToken>${header.clientGroupToken}</clientGroupToken>
      <clientToken>${header.clientToken}</clientToken>
    </nexauth:authTokens>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.xsd">
      <wsse:UserNameToken>
        <wsse:Username>${header.username}</wsse:Username>
        <wsse:Pasword type="http://docs.oasis#passwordText">${header.password}</wsse:Pasword>
      </wsse:UserNameToken>
    </wsse:Security>`;
}
