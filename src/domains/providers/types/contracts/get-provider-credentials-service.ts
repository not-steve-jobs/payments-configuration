export interface GetProviderCredentialsServiceParams {
  providerCode: string;
}

export interface CredentialDetails {
  [key: string]: string;
  key: string;
  value: string;
}

export interface CredentialsDataParameters {
  [key: string]: string | undefined;
  authority?: string;
  currency?: string;
  country?: string;
}

export interface CredentialsData {
  parameters: CredentialsDataParameters;
  credentialsDetails: CredentialDetails[];
}

export interface CredentialsGroupedData {
  parameters: {
    countryAuthorities?: CredentialsDataParameters[];
    currencies?: string[];
  };
  credentialsDetails: CredentialDetails[];
}

export interface GetProviderCredentialsServiceResponse {
  credentialsData: CredentialsGroupedData[];
}
