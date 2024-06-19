import { CredentialsGroupedData } from './get-provider-credentials-service';

export interface UpdateProviderCredentialsServiceParams {
  providerCode: string;
  credentialsData: CredentialsGroupedData[];
}

export interface UpdateProviderCredentialsServiceResponse {
  credentialsData: CredentialsGroupedData[];
}
