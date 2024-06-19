
export interface CredentialDetailsDto {
  [key: string]: string;
  key: string;
  value: string;
}

export interface CredentialDto  {
  providerCode: string;
  authorityFullCode: string | null;
  countryIso2: string | null;
  currencyIso3: string | null;
  credentialsDetails: CredentialDetailsDto[];
}
