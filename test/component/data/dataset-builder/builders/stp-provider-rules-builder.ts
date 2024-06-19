import { StpProviderRuleEntity } from '@core';
import { DbTable } from '@internal/component-test-library';

import { Builder } from './abstract-builder';

export class StpProviderRulesBuilder extends Builder<StpProviderRuleEntity> {
  public tableName = DbTable.cpStpProviderRules;

  protected getNewEntity(payload: Partial<StpProviderRuleEntity>): StpProviderRuleEntity {
    return {
      authorityFullCode: payload.authorityFullCode!,
      countryIso2: payload.countryIso2 ?? null,
      providerCode: payload.providerCode!,
      isEnabled: payload.isEnabled ?? true,
      data: payload.data ?? null,
    };
  }
}
