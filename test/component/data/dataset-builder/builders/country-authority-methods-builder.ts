import { randomUUID } from 'crypto';

import { DbTable } from '@internal/component-test-library';
import { CountryAuthorityMethodEntity } from '@core';

import { Builder } from './abstract-builder';

export class CountryAuthorityMethodsBuilder extends Builder<CountryAuthorityMethodEntity> {
  public tableName = DbTable.cpCountryAuthorityMethods;

  protected getNewEntity(payload: Partial<CountryAuthorityMethodEntity>): CountryAuthorityMethodEntity {
    return {
      id: randomUUID(),
      countryAuthorityId: payload.countryAuthorityId!,
      methodId: payload.methodId!,
      isEnabled: payload.isEnabled || false,
      depositsOrder: payload.depositsOrder ?? null,
      createdBy: '',
      updatedBy: '',
    };
  }
}
