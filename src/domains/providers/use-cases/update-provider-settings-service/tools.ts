import { ProviderCASettings, ProviderCASettingsDto, ProviderDefaultCurrencySettings } from '@domains/providers/types';
import { ProviderMethodSettingsUpdateDto, ProviderMethodWithCountryAuthority } from '@core';
import { buildKey } from '@utils';

export const buildPayload = (
  countryAuthoritySettings: ProviderCASettingsDto[],
  providerMethods: ProviderMethodWithCountryAuthority[]
): Array<ProviderMethodSettingsUpdateDto> => {
  const countryAuthorityToSettingsMap = new Map(countryAuthoritySettings.map(({ country, authority, settings }) => [buildKey(country, authority), settings]));

  return providerMethods.reduce((arr, pm) => {
    const key = buildKey(pm.countryIso2, pm.authorityFullCode);
    const settingsToUpdate = countryAuthorityToSettingsMap.get(key);

    if (settingsToUpdate && shouldUpdateProviderMethod(pm, settingsToUpdate)) {
      arr.push(buildPayloadToUpdate(pm, settingsToUpdate));
    }

    return arr;
  }, [] as Array<ProviderMethodSettingsUpdateDto>);
};

const buildPayloadToUpdate = (pm: ProviderMethodWithCountryAuthority, settingsToUpdate: ProviderCASettings): ProviderMethodSettingsUpdateDto => ({
  id: pm.id,
  isPaymentAccountRequired: settingsToUpdate.isPaymentAccountRequired,
  isPayoutAsRefund: settingsToUpdate.isPayoutAsRefund,
  defaultCurrency: getDefaultCurrency(pm, settingsToUpdate.defaultCurrency),
});

const getDefaultCurrency = (pm: ProviderMethodWithCountryAuthority, defaultCurrency?: ProviderDefaultCurrencySettings | null): string | null => {
  if (defaultCurrency) {
    const isBoundedToMethod = defaultCurrency.methods.includes(pm.methodCode);

    // If settings includes method to update - we set for only this provider method, and set as null for the rest
    if (isBoundedToMethod) {
      return JSON.stringify({
        isEnabled: defaultCurrency.isEnabled,
        currency: defaultCurrency.currency,
      });
    }
  }

  return null;
};

const shouldUpdateProviderMethod = (
  pm: ProviderMethodWithCountryAuthority,
  providerSettings: ProviderCASettings
): boolean => {
  if (providerSettings.isPaymentAccountRequired !== pm.isPaymentAccountRequired) {
    return true;
  }

  if (providerSettings.isPayoutAsRefund !== pm.isPayoutAsRefund) {
    return true;
  }

  return !!(providerSettings.defaultCurrency || providerSettings.defaultCurrency === null);
};
