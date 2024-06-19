export interface GetDepositConfigsServiceParams {
  authority: string;
  country: string;
  platform?: string;
  version?: string;
}

export interface DepositConfig {
  key: string;
  description: string;
  provider: string;
  currencySettings: DepositCurrencySetting[];
  convertedCurrency: string | null;
  defaultCurrency: string | null;
  type: string | null;
  fields: DepositConfigField[];
}

export interface DepositCurrencySetting {
  currency: string;
  min?: number;
  max: number | null;
}

export interface DepositConfigField {
  key: string;
  value: string;
  type: string;
  required: boolean;
  pattern: string;
  options: DepositConfigFieldOption[];
}

export interface DepositConfigFieldOption {
  key: string;
  value: string;
}
