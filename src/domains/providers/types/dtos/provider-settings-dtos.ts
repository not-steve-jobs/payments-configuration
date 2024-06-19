export interface ProviderSettingsResponse {
  provider: ProviderSettingsDto;
  countryAuthoritySettings: ProviderCASettingsDto[];
}

export interface ProviderSettingsDto {
  type: string;
  convertedCurrency: string | null;
}

export interface ProviderDefaultCurrencySettings {
  isEnabled: boolean;
  currency: string;
  methods: string[];
}

export interface ProviderCASettings {
  isPayoutAsRefund: boolean;
  isPaymentAccountRequired: boolean;
  defaultCurrency?: ProviderDefaultCurrencySettings | null;
}

export interface ProviderCASettingsDto {
  country: string;
  authority: string;
  settings: ProviderCASettings;
}
