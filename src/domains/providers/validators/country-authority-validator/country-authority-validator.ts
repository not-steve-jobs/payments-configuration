import { CountryAuthorityDto, CountryAuthorityEntity } from '@core';
import { ConflictError } from '@internal/errors-library';
import { buildKey } from '@utils';

export interface CountryAuthorityValidatorParams {
  countriesAuthorities: Partial<CountryAuthorityDto>[];
  countriesAuthoritiesBounded: Partial<CountryAuthorityEntity>[];
}

export class CountryAuthorityValidator {
  public static validate({ countriesAuthoritiesBounded, countriesAuthorities }: CountryAuthorityValidatorParams): void {
    const countriesAuthoritiesBoundedSet = countriesAuthoritiesBounded.reduce((acc, next) => {
      acc.add(buildKey(next.countryIso2, next.authorityFullCode));
      acc.add(buildKey('', next.authorityFullCode));
      acc.add(buildKey(next.countryIso2, ''));
      acc.add(buildKey('', ''));
      return acc;
    }, new Set<string>());
    const seen: Set<string> = new Set();

    for (const ca of countriesAuthorities) {
      const key = buildKey(ca.country, ca.authority);
      if (seen.has(key)) {
        throw new ConflictError(`In the request there are countries-authorities with duplicates`, { id: this.normalizeErrorMeta(key) });
      }

      if (!countriesAuthoritiesBoundedSet.has(key)) {
        throw new ConflictError('In the request there are countries-authorities that are not mapped to the provider', { id: this.normalizeErrorMeta(key) });
      }

      seen.add(key);
    }
  }

  private static normalizeErrorMeta(key: string): string {
    const [country, authority] = key.split(':');

    if (country && authority) {
      return key.toUpperCase();
    }

    return (country || authority).toUpperCase();
  }
}
