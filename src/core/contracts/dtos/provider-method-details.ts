export interface ProviderMethodSettingsUpdateDto {
  id: string;
  isPaymentAccountRequired: boolean;
  isPayoutAsRefund: boolean;
  defaultCurrency: string | null;
}

export interface ProviderMethodWithCountryAuthority {
  id: string;
  authorityFullCode: string;
  countryIso2: string;
  countryAuthorityMethodId: string;
  providerId: string;
  isEnabled: boolean;
  isPayoutAsRefund: boolean;
  isPaymentAccountRequired: boolean;
  defaultCurrency: string;
  methodCode: string;
}

export interface ProviderMethodDetails extends ProviderMethodWithCountryAuthority {
  methodCode: string;
}

export interface ProviderMethodLimitStats {
  countryName: string;
  countryIso3: string;
  authorityFullCode: string;
  methodName: string;
  providerCode: string;
  configsType: string;
  configsCurrencyIso3: string;
  configsMinAmount: number;
  configsMaxAmount: number;
  configsIsEnabled: boolean;
  configsPeriod: boolean;
  depositsOrder: number;
  configsUpdatedAt: Date;
}
