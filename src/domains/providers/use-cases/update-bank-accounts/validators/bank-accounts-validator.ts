import { MaxAllowedCurrenciesExceededError } from '@domains/providers/errors';
import { BankAccountsGroupedData, CountryAuthorityDto, CountryAuthorityEntity, CurrencyEntity } from '@core';
import { ConflictError, NotFoundError } from '@internal/errors-library';
import { buildKey } from '@utils';

interface CredentialsValidatorParams {
  boundedCAs: CountryAuthorityEntity[];
  existingCurrencies: CurrencyEntity[];
}

const CURRENCIES_MAX_LIMIT = 15;

export class BankAccountsValidator {
  public static validate(
    bankAccountsData: BankAccountsGroupedData[],
    params: CredentialsValidatorParams
  ): void | never {
    this.validateCurrencies(
      bankAccountsData,
      params.existingCurrencies.map(c => c.iso3)
    );
    this.validateCountriesAuthorities(bankAccountsData, params.boundedCAs);
    this.validateAccountsUniqueness(bankAccountsData);
  }

  public static validateCurrencies(
    bankAccountsData: BankAccountsGroupedData[],
    existingCurrencies: string[]
  ): void | never {
    bankAccountsData.forEach(ba => {
      const currencies = ba.parameters.currencies;
      if (currencies.length > CURRENCIES_MAX_LIMIT) {
        throw new MaxAllowedCurrenciesExceededError(ba.parameters.currencies.length, CURRENCIES_MAX_LIMIT);
      }

      const validateDuplication = (() => {
        const currenciesSet = new Set<string>();
        return (currency: string) => {
          if (currenciesSet.has(currency)) {
            throw new ConflictError(`In the request there are currencies with duplicates`, { id: currency });
          }

          currenciesSet.add(currency);
        };
      })();

      currencies.forEach(c => {
        const currencyUpperCase = c.toUpperCase();

        validateDuplication(currencyUpperCase);

        if (!existingCurrencies.includes(currencyUpperCase)) {
          throw new NotFoundError('Unknown currency', { id: { iso3: c } });
        }
      });
    });
  }

  private static validateCountriesAuthorities(
    bankAccountsData: BankAccountsGroupedData[],
    boundedCAs: CountryAuthorityEntity[]
  ): void | never {
    const countriesAuthorities: CountryAuthorityDto[] = bankAccountsData.flatMap(ba =>
      ba.parameters.countryAuthorities.map(ca => ({
        authority: ca.authority ?? '',
        country: ca.country ?? '',
      }))
    );

    this.validateProviderMapping(countriesAuthorities, boundedCAs);
  }

  private static validateProviderMapping(
    countriesAuthorities: Partial<CountryAuthorityDto>[],
    countriesAuthoritiesBounded: Partial<CountryAuthorityEntity>[]
  ): void {
    const countriesAuthoritiesBoundedSet = countriesAuthoritiesBounded.reduce((acc, next) => {
      acc.add(buildKey(next.countryIso2, next.authorityFullCode));
      acc.add(buildKey('', next.authorityFullCode));
      acc.add(buildKey(next.countryIso2, ''));
      acc.add(buildKey('', ''));
      return acc;
    }, new Set<string>());

    for (const ca of countriesAuthorities) {
      const key = buildKey(ca.country, ca.authority);

      if (!countriesAuthoritiesBoundedSet.has(key)) {
        throw new ConflictError('In the request there are countries-authorities that are not mapped to the provider', { id: this.normalizeErrorMeta(key) });
      }
    }
  }

  private static normalizeErrorMeta(key: string): string {
    const [country, authority] = key.split(':');

    if (country && authority) {
      return key.toUpperCase();
    }

    return (country || authority).toUpperCase();
  }

  private static validateAccountsUniqueness(bankAccountsData: BankAccountsGroupedData[]): void | never {
    const uniqueCombinations = new Set<string>();

    for (const {
      parameters: { countryAuthorities, currencies },
    } of bankAccountsData) {
      for (const ca of countryAuthorities) {
        for (const currency of currencies) {
          const key = buildKey(ca.authority, ca.country, currency);

          if (uniqueCombinations.has(key)) {
            throw new ConflictError(
              `Duplicate rules detected for: ${key.toUpperCase()}. Please ensure unique combinations for rules before updating`,
              { id: key.toUpperCase() }
            );
          }
          uniqueCombinations.add(key);
        }
      }
    }
  }
}
