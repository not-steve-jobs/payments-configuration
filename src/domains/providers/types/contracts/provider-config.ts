import { CurrencySetting } from './currency-setting';

export interface ProviderConfig {
  providerCode: string;
  providerName: string;
  isEnabled: boolean;
  currencySettings: CurrencySetting[];
}
