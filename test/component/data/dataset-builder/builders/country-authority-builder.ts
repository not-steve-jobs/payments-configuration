import { randomUUID } from 'crypto';

import { DbTable } from '@internal/component-test-library';
import { CountryAuthorityEntity } from '@core';

import { Builder } from './abstract-builder';

export class CountryAuthorityBuilder extends Builder<CountryAuthorityEntity> {
  public tableName = DbTable.cpCountriesAuthorities;

  protected getNewEntity(payload: Partial<CountryAuthorityEntity>): CountryAuthorityEntity {
    return {
      id: payload.id ?? randomUUID(),
      authorityFullCode: payload.authorityFullCode ?? this.getRandomWord(3),
      countryIso2: payload.countryIso2 ?? this.getRandomWord(2),
      adminApiId: null,
    };
  }
}
