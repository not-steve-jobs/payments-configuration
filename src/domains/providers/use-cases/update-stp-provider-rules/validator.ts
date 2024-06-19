import { AuthorityEntity, CountryAuthorityEntity, StpRuleEntity } from '@core/contracts';
import { StpProviderRulesWithCaDto, StpRuleType } from '@domains/providers/types';
import { CountryAuthorityValidator } from '@domains/providers/validators';
import { ConflictError, NotFoundError } from '@internal/errors-library';

export interface UpdateStpProviderRulesValidatorParams {
  authorities: AuthorityEntity[];
  stpRules: StpRuleEntity[];
  stpProviderRules: StpProviderRulesWithCaDto[];
  countriesAuthoritiesBounded: CountryAuthorityEntity[];
}

export class UpdateStpProviderRulesValidator {
  public static validate(params: UpdateStpProviderRulesValidatorParams): void | never {
    this.validateStpRuleKeys(params);
    this.validateAuthorities(params);
    this.validateCountriesAuthorities(params);
  }

  private static validateCountriesAuthorities(params: UpdateStpProviderRulesValidatorParams): void | never {
    const { stpProviderRules, countriesAuthoritiesBounded } = params;

    const countriesAuthorities = Array.from(
      new Set(
        stpProviderRules.flatMap(rule => rule.countriesAuthorities.map(ca => ({ authority: ca.authority, country: '' })))
      )
    );

    CountryAuthorityValidator.validate({ countriesAuthorities, countriesAuthoritiesBounded });
  }

  private static validateAuthorities(params: UpdateStpProviderRulesValidatorParams): void | never {
    const authoritiesSet = new Set<string>(params.authorities.map(sr => sr.fullCode));

    for (const rule of params.stpProviderRules) {
      for (const { authority } of rule.countriesAuthorities) {
        if (!authoritiesSet.has(authority)) {
          throw new NotFoundError('Unknown authority', { id: authority });
        }
      }
    }
  }

  private static validateStpRuleKeys(params: UpdateStpProviderRulesValidatorParams): void | never {
    const stpRulesSet = new Set<string>(params.stpRules.map(sr => sr.key));

    for (const rule of params.stpProviderRules) {
      const stpRulesByCA = new Set<string>();

      for (const stpRule of rule.stpRules) {
        if (!stpRulesSet.has(stpRule.key)) {
          throw new NotFoundError('Unknown rule key', { id: stpRule.key });
        }

        if (stpRulesByCA.has(stpRule.key)) {
          throw new ConflictError(`In the request there are rules with duplicates`, {
            id: { key: stpRule.key, countriesAuthorities: rule.countriesAuthorities },
          });
        }

        if (stpRule.value && !stpRule.type) {
          throw new ConflictError(`type is required`, { id: { type: stpRule.type, value: stpRule.value } });
        }

        if (stpRule.type && !stpRule.value) {
          throw new ConflictError(`value is required`, { id: { type: stpRule.type, value: stpRule.value } });
        }

        {if (
          (stpRule.type === StpRuleType.LIST && !Array.isArray(stpRule.value)) ||
          (stpRule.type === StpRuleType.NUMBER && Array.isArray(stpRule.value))
        ) {
          throw new ConflictError(`value must be an ${stpRule.type === StpRuleType.LIST ? 'array' : 'string'}`, {
            id: { key: stpRule.key, type: stpRule.type, value: stpRule.value },
          });
        }}

        stpRulesByCA.add(stpRule.key);
      }
    }
  }
}
