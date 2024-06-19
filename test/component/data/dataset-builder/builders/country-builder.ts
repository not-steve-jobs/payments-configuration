import { DbTable } from '@internal/component-test-library';
import { CountryEntity } from '@core';

import { Builder } from './abstract-builder';

export class CountryBuilder extends Builder<CountryEntity> {
  public tableName = DbTable.cpCountries;

  protected getNewEntity(payload: Partial<CountryEntity>): CountryEntity {
    return {
      iso2: payload.iso2 || this.getRandomLetters(2),
      iso3: payload.iso3 || this.getRandomLetters(3),
      name: payload.name || this.getRandomWord(32),
      group: payload.group || this.getRandomWord(30),
      adminApiId: payload.adminApiId || null,
    };
  }
}
