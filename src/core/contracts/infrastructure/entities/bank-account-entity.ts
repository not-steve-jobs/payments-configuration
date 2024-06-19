import { Entity } from './entity';

/**
 * Table: cp_bankAccounts
 */
export interface BankAccountEntity extends Entity {
  name: string;
  type: string;
  providerCode: string;
  authorityFullCode: string;
  countryIso2: string | null;
  currencyIso3: string;
  configs: string;
}
