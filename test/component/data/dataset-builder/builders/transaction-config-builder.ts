import casual from 'casual';
import { randomUUID } from 'crypto';

import { DbTable } from '@internal/component-test-library';
import { TransactionConfigEntity, TransactionType } from '@core';

import { Builder } from './abstract-builder';

export class TransactionConfigBuilder extends Builder<TransactionConfigEntity> {
  public tableName = DbTable.cpTransactionConfigs;

  protected getNewEntity(payload: Partial<TransactionConfigEntity>): TransactionConfigEntity {
    return {
      id: randomUUID(),
      providerMethodId: payload.providerMethodId!,
      currencyIso3: payload.currencyIso3 || casual.random_value(['EUR', 'USD']),
      type: payload.type || casual.random_value(TransactionType),
      isEnabled: payload.isEnabled ?? casual.random_value([true, false]),
      minAmount: payload.minAmount || 0,
      maxAmount: payload.maxAmount || 100,
      period: payload.period || 0,
      order: payload.order || 0,
      createdBy: payload.createdBy || '',
      updatedBy: payload.updatedBy || '',
    };
  }
}
