import { ProviderCASettingsDto } from '@domains/providers/types/dtos/provider-settings-dtos';
import { ProviderType } from '@core';

export interface UpdateProviderSettingsServiceParams {
  provider: ProviderSettings;
  countryAuthoritySettings: ProviderCASettingsDto[];
}

export interface ProviderSettings {
  code: string;
  type: ProviderType;
  convertedCurrency: string | null;
}

