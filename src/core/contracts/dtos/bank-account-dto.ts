export interface BankAccountDto  {
  name: string;
  type: string;
  providerCode: string;
  authorityFullCode: string;
  countryIso2: string | null;
  currencyIso3: string;
  configs: BankAccountConfig[];
}

export interface BankAccountConfig {
  [key: string]: string;
  key: string;
  value: string;
}

export interface BankAccountData {
  parameters: BankAccountDataParameters;
  bankAccounts: BankAccount[];
}

export interface BankAccount {
  name: string;
  type: string;
  configs: BankAccountConfig[];
}

export interface BankAccountDataParameters {
  [key: string]: string | null;
  authority: string;
  currency: string;
  country: string | null;
}

export interface BankAccountsGroupedData {
  parameters: BankAccountsGroupedDataParams;
  bankAccounts: BankAccount[];
}

export interface BankAccountsGroupedDataParams {
  countryAuthorities: Omit<BankAccountDataParameters, 'currency'>[];
  currencies: string[];
}

export interface BankAccountsData {
  bankAccountsData: BankAccountsGroupedData[];
}

