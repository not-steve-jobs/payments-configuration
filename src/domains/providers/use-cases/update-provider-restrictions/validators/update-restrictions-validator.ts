import { ConflictError } from '@internal/errors-library';
import { Condition, ProviderRestrictionsGroupDto } from '@domains/providers/types';
import { CountryAuthorityValidator } from '@domains/providers/validators';
import { CountryAuthorityEntity } from '@core';

interface UpdateRestrictionsValidateParams {
  countriesAuthoritiesBounded: CountryAuthorityEntity[];
}

interface UpdateRestrictionsValidateParams {
  countriesAuthoritiesBounded: CountryAuthorityEntity[];
}

export class UpdateRestrictionsValidator {
  public static validate(restrictions: ProviderRestrictionsGroupDto[], params: UpdateRestrictionsValidateParams): void | never {
    this.validatePlatforms(restrictions);
    this.validateCountriesAuthorities(restrictions, params.countriesAuthoritiesBounded);
    this.validateSettings(restrictions);
  }

  private static validatePlatforms(restrictions: ProviderRestrictionsGroupDto[]): void | never {
    const platforms = restrictions.map(r => r.platform);
    if (restrictions.length !== new Set(platforms).size) {
      throw new ConflictError(`Restrictions contain platform duplicates`, { id: platforms.join(', ') });
    }
  }

  private static validateCountriesAuthorities(
    restrictions: ProviderRestrictionsGroupDto[],
    countriesAuthoritiesBounded: CountryAuthorityEntity[]
  ): void | never {
    for (const restriction of restrictions) {
      CountryAuthorityValidator.validate({
        countriesAuthorities: restriction.countriesAuthorities,
        countriesAuthoritiesBounded,
      });
    }
  }

  private static validateSettings(restrictions: ProviderRestrictionsGroupDto[]): void | never {
    for (const restriction of restrictions) {
      const seenConditions: Record<Condition, number> = { lte: 0, gte: 0, eq: 0 };
      const seenVersions: Set<string> = new Set();

      for (const { condition, version } of restriction.settings) {
        if (seenConditions[condition]++ > 0 && condition !== Condition.EQ) {
          throw new ConflictError(`${restriction.platform} restrictions contain duplicate conditions`, { id: condition });
        }

        if (seenVersions.has(version)) {
          throw new ConflictError(`${restriction.platform} restrictions contain duplicate versions`, { id: version });
        }

        seenVersions.add(version);
      }
    }
  }
}
