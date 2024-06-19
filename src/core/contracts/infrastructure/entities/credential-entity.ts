import { Entity } from './entity';

/**
 * Table: cp_credentials
 */
export interface CredentialEntity extends Entity {
  providerCode: string;
  authorityFullCode: string | null;
  countryIso2: string | null;
  currencyIso3: string | null;
  credentialsDetails: string;
}
