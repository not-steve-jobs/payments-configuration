import casual from 'casual';
import { randomUUID } from 'crypto';

import { DEFAULT_FIELD_PATTERN, FieldEntity, FieldEntityType, TransactionType } from '@core';
import { DbTable } from '@internal/component-test-library';

import { Builder } from './abstract-builder';

export class FieldBuilder extends Builder<FieldEntity> {
  public tableName = DbTable.cpFields;

  protected getNewEntity(payload: Partial<FieldEntity>): FieldEntity {
    const value = 'value' in payload
      ? payload.value ?? null
      : casual.string;

    return {
      id: randomUUID(),
      entityId: payload.entityId!,
      entityType: payload.entityType || FieldEntityType.PROVIDER_METHOD,
      currencyIso3: payload.currencyIso3 || '',
      transactionType: payload.transactionType || TransactionType.DEPOSIT,
      key: payload.key || casual.string,
      valueType: payload.valueType || casual.string,
      value,
      defaultValue: payload.defaultValue || casual.string,
      pattern: this.getValueOrDefault(payload.pattern, DEFAULT_FIELD_PATTERN),
      isMandatory: payload.isMandatory || false,
      isEnabled: payload.isEnabled || false,
      adminApiId: casual.integer(0, 1000),
    };
  }
}
