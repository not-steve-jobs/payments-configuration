import { DbTable } from '@internal/component-test-library';
import { CurrencyEntity } from '@core';

import { Builder } from './abstract-builder';

export class CurrencyBuilder extends Builder<CurrencyEntity> {
  public tableName = DbTable.cpCurrencies;

  protected getNewEntity(payload: Partial<CurrencyEntity>): CurrencyEntity {
    return { iso3: payload.iso3 || this.getRandomLetters(3) };
  }
}
