import casual from 'casual';

import { DbTable } from '@internal/component-test-library';
import { StpRuleEntity } from '@core';

import { Builder } from './abstract-builder';

export class StpRuleBuilder extends Builder<StpRuleEntity> {
  public tableName = DbTable.cpStpRules;

  protected getNewEntity(payload: Partial<StpRuleEntity>): StpRuleEntity {
    return {
      id: payload.id ?? '1',
      key: payload.key ?? casual.string,
      description: payload.description ?? null,
      order: payload.order ?? 1,
      data: payload.data ?? null,
    };
  }
}
