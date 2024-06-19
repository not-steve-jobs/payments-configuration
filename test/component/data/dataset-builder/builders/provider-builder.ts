import { randomUUID } from 'crypto';

import { DbTable } from '@internal/component-test-library';
import { ProviderEntity, ProviderType } from '@core';

import { Builder } from './abstract-builder';

export class ProviderBuilder extends Builder<ProviderEntity> {
  public tableName = DbTable.cpProviders;

  protected getNewEntity(payload: Partial<ProviderEntity>): ProviderEntity {
    return {
      id: randomUUID(),
      name: payload.name || this.getRandomWord(),
      code: payload.code || randomUUID().substring(0,20),
      type: payload.type || ProviderType.DEFAULT,
      description: payload.description || this.getRandomWord(),
      convertedCurrency: payload.convertedCurrency || null,
      isEnabled: payload.isEnabled ?? true,
    };
  }
}
