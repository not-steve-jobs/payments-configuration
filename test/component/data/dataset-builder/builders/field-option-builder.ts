import { randomUUID } from 'crypto';

import { FieldOptionEntity } from '@core';
import { DbTable } from '@internal/component-test-library';

import { Builder } from './abstract-builder';

export class FieldOptionBuilder extends Builder<FieldOptionEntity> {
  public tableName = DbTable.cpFieldOptions;

  protected getNewEntity(payload: Partial<FieldOptionEntity>): FieldOptionEntity {
    return {
      id: randomUUID(),
      fieldId: payload.fieldId!,
      key: payload.key || this.getRandomWord(),
      value: payload.value || this.getRandomWord(),
      isEnabled: payload.isEnabled ?? true,
    };
  }
}
