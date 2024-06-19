import casual from 'casual';

import { DEFAULT_FIELD_PATTERN, ProviderFieldsEntity, TransactionType } from '@core';
import { DbTable } from '@internal/component-test-library';

import { Builder } from './abstract-builder';

export class ProviderFieldsBuilder extends Builder<ProviderFieldsEntity> {
  public tableName = DbTable.cpProviderFields;

  protected getNewEntity(payload: Partial<ProviderFieldsEntity>): ProviderFieldsEntity {
    return {
      providerCode: payload.providerCode || casual.string,
      countryIso2: this.getValueOrDefault(payload.countryIso2, 'CY'),
      authorityFullCode: this.getValueOrDefault(payload.authorityFullCode, 'CYSEC'),
      currencyIso3: this.getValueOrDefault(payload.currencyIso3, null),
      transactionType: payload.transactionType || TransactionType.DEPOSIT,
      fields: payload.fields ?? JSON.stringify([
        {
          key: casual.string,
          valueType: casual.string,
          defaultValue: casual.string,
          pattern: DEFAULT_FIELD_PATTERN,
          isMandatory: true,
          isEnabled: true,
          options: [],
        },
      ]),
    };
  }
}
