import { CurrencySetting, ProviderConfig } from '@domains/providers';

export type UpdateProviderMethodConfig = Omit<ProviderConfig, 'providerName'>;

export interface UpdateProviderMethodConfigsServiceParams {
  country: string;
  authority: string;
  methodCode: string;
  providerConfigs: UpdateProviderMethodConfig[];
  author?: string;
}

export interface UpdateConfigsByTypeParams {
  providerMethodId: string;
  currencySetting: CurrencySetting;
}
