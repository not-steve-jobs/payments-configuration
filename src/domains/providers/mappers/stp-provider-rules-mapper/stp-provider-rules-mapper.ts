import { StpProviderRulesWithCaDto, StpRuleDto } from '@domains/providers/types';
import { buildKey, groupBy } from '@utils';
import { StpProviderRuleEntity, StpRuleEntity } from '@core';

export class StpProviderRulesMapper {
  public static mapToStpRulesWithCA(stpProviderRulesEntities: StpProviderRuleEntity[]): StpProviderRulesWithCaDto[] {
    const dataHashToRules = groupBy(stpProviderRulesEntities, ({ data, isEnabled }) => buildKey(data, isEnabled));
    const dataToReturn: StpProviderRulesWithCaDto[] = [];

    for (const providerRules of dataHashToRules.values()) {
      const { data, isEnabled } = providerRules[0] || { data: [], isEnabled: true };

      const authorities = providerRules.reduce((acc, next) => (acc.add(next.authorityFullCode), acc), new Set<string>());
      const countriesAuthorities = Array.from(authorities).map(authority => ({ authority }));

      dataToReturn.push({ countriesAuthorities, stpRules: data ? JSON.parse(data) : [], isEnabled });
    }

    return dataToReturn;
  }

  public static mapStpRulesWithCAToEntities(providerCode: string, stpRules: StpRuleEntity[],
                                            stpRulesWithCA: StpProviderRulesWithCaDto[]): StpProviderRuleEntity[] {
    const dataToReturn: StpProviderRuleEntity[] = [];

    const sortStpRules = this.createStpRulesSorter(stpRules);

    for (const stpRuleWithCA of stpRulesWithCA) {
      for (const ca of stpRuleWithCA.countriesAuthorities) {
        const sortedRules = sortStpRules(stpRuleWithCA.stpRules);

        dataToReturn.push({
          providerCode,
          isEnabled: stpRuleWithCA.isEnabled,
          countryIso2: null,
          authorityFullCode: ca.authority,
          data: JSON.stringify(sortedRules),
        });
      }
    }

    return dataToReturn;
  }

  private static createStpRulesSorter(stpRules: StpRuleEntity[]): (rules: StpRuleDto[]) => StpRuleDto[] {
    const rulesOrderMap = new Map<string, number>(stpRules.map(r => [r.key, r.order]));

    return (rules: StpRuleDto[]) => rules.sort((r1, r2) =>
      (rulesOrderMap.get(r1.key) ?? Number.MAX_SAFE_INTEGER) - (rulesOrderMap.get(r2.key) ?? Number.MAX_SAFE_INTEGER));
  }
}
