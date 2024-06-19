import { ProviderEntity, ProviderMethodDefaultCurrency, ProviderMethodWithCountryAuthority } from '@core';
import {
  ProviderCASettingsDto, ProviderDefaultCurrencySettings,
  ProviderSettingsDto,
  ProviderSettingsResponse,
} from '@domains/providers';
import { parseJSONSafe } from '@utils';

export class ProviderSettingsMapper {
  public static createDto(provider: ProviderEntity, providerMethods: ProviderMethodWithCountryAuthority[]): ProviderSettingsResponse {
    const settingsMap = new Map<string, ProviderCASettingsDto>();

    for (const pm of providerMethods) {
      const key = `${pm.countryIso2}:${pm.authorityFullCode}`;
      const dto = settingsMap.get(key) || {
        country: pm.countryIso2,
        authority: pm.authorityFullCode,
        settings: {
          isPayoutAsRefund: pm.isPayoutAsRefund,
          isPaymentAccountRequired: pm.isPaymentAccountRequired,
          defaultCurrency: null,
        },
      };

      if (pm.defaultCurrency) {
        const defaultCurrency = parseJSONSafe<ProviderMethodDefaultCurrency>(pm.defaultCurrency);
        const defaultCurrencySettings: ProviderDefaultCurrencySettings | null = dto.settings.defaultCurrency || (defaultCurrency ? {
          isEnabled: defaultCurrency.isEnabled,
          currency: defaultCurrency.currency,
          methods: [],
        } : null);

        if (defaultCurrencySettings) {
          defaultCurrencySettings.methods.push(pm.methodCode);
        }

        dto.settings.defaultCurrency = defaultCurrencySettings;
      }

      settingsMap.set(key, dto);
    }

    return {
      provider: this.createProviderSettings(provider),
      countryAuthoritySettings: Array.from(settingsMap.values()),
    };
  }

  private static createProviderSettings(provider: ProviderEntity): ProviderSettingsDto {
    return {
      type: provider.type,
      convertedCurrency: provider.convertedCurrency,
    };
  }
}
