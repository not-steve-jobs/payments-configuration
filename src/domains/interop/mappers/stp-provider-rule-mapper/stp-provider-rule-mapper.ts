import { StpProviderRuleInterop } from '@domains/interop';
import { StpRuleEntity } from '@core/contracts/infrastructure/entities/stp-rule-entity';
import { InternalServerError } from '@internal/errors-library';
import { StpProviderRuleDto, StpProviderRuleEntity } from '@core';

export class StpProviderRuleMapper {
  public static getDtos(entity: StpProviderRuleEntity): StpProviderRuleDto[] {
    return entity.data ? JSON.parse(entity.data) : [];
  }

  public static getStpProviderRuleInterop(providerRule: StpProviderRuleDto, stpRules: StpRuleEntity[]): StpProviderRuleInterop {
    const stpRule = stpRules.find(s => s.key === providerRule.key);
    if (!stpRule) {
      throw new InternalServerError(`Unknown stp rule "${providerRule.key}"`);
    }

    const value = providerRule.value ?? null;
    const allowType = value !== null ? 1 : null;

    return {
      id: parseInt(stpRule.id),
      key: stpRule.key,
      description: stpRule.description ?? '',
      allowType,
      valueType: providerRule.type || null,
      value: providerRule.value ?? null,
      enforceAuto: null,
      isEnabled: providerRule.isEnabled,
      orderId: stpRule.order,
    };
  }
}
