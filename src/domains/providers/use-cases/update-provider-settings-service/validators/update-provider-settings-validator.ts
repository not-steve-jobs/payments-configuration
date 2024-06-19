import { ProviderCASettingsDto } from '@domains/providers';
import { BoundedCurrencyToMethodDto, CountryAuthorityEntity, ProviderMethodWithCountryAuthority } from '@core';
import { ConflictError, ValidationError } from '@internal/errors-library';
import { CountryAuthorityValidator } from '@domains/providers/validators';
import { buildKey, groupBy } from '@utils';

export interface UpdateProviderSettingsValidatorOptions {
  countryAuthoritySettings: ProviderCASettingsDto[];
  providerMethods: ProviderMethodWithCountryAuthority[];
  boundedCurrenciesToMethods: BoundedCurrencyToMethodDto[];
}

export class UpdateProviderSettingsValidator {
  public static validate(options: UpdateProviderSettingsValidatorOptions): void | never {
    const { countryAuthoritySettings, providerMethods, boundedCurrenciesToMethods } = options;

    const countriesAuthoritiesBounded: Partial<CountryAuthorityEntity>[] = providerMethods.map(({ authorityFullCode, countryIso2 }) =>
      ({ authorityFullCode, countryIso2 }));

    CountryAuthorityValidator.validate({
      countriesAuthoritiesBounded,
      countriesAuthorities: countryAuthoritySettings,
    });
    this.validateCountryAuthorityExistence(countriesAuthoritiesBounded, countryAuthoritySettings);
    this.validateDefaultCurrency(boundedCurrenciesToMethods, countryAuthoritySettings);
  }

  private static validateDefaultCurrency(
    boundedCurrenciesToMethods: BoundedCurrencyToMethodDto[],
    countryAuthoritySettings: ProviderCASettingsDto[]
  ): void | never {
    const keyToCurrencies = groupBy(boundedCurrenciesToMethods, bcm => buildKey(bcm.authorityFullCode, bcm.countryIso2, bcm.methodCode));

    for (const cas of countryAuthoritySettings) {
      if (!cas.settings.defaultCurrency) {
        continue;
      }

      const { methods, currency } = cas.settings.defaultCurrency;
      for (const method of methods) {
        const key = buildKey(cas.authority, cas.country, method);
        const boundedCurrencies = keyToCurrencies.get(key) ?? [];

        if (!boundedCurrencies) {
          throw new ValidationError(`The ${method} method isn't mapped to '${cas.authority}' authority for ${cas.country}, or lacks transaction configs.`);
        }

        const unknownCurrency = !boundedCurrencies.find(b => b.currencyIso3 === currency);
        if (unknownCurrency) {
          throw new ValidationError(`The ${method} method isn't mapped to ${currency} in ${cas.authority} authority for ${cas.country} country.`);
        }
      }
    }
  }

  private static validateCountryAuthorityExistence(
    countriesAuthoritiesBounded: Partial<CountryAuthorityEntity>[],
    providerCASettings: ProviderCASettingsDto[]
  ): void | never {
    const countryAuthoritySetToUpdate = providerCASettings.reduce((acc, next) => {
      acc.add(`${next.country}:${next.authority}`.toUpperCase());

      return acc;
    }, new Set<string>());

    for (const { countryIso2, authorityFullCode } of countriesAuthoritiesBounded) {
      const key = `${countryIso2}:${authorityFullCode}`.toUpperCase();
      if (!countryAuthoritySetToUpdate.has(key)) {
        throw new ConflictError(`Settings for "${key}" missed in request`, { id: key });
      }
    }
  }
}
