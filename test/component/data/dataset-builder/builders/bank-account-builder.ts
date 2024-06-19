import casual from 'casual';

import { DbTable } from '@internal/component-test-library';
import { BankAccountEntity } from '@core/contracts/infrastructure/entities';

import { Builder } from './abstract-builder';

export class BankAccountBuilder extends Builder<BankAccountEntity> {
  public tableName = DbTable.cpBankAccounts;

  protected getNewEntity(payload: Partial<BankAccountEntity>): BankAccountEntity {
    return {
      name: payload.name ?? casual.string,
      type: payload.type ?? this.getRandomWord(),
      providerCode: payload.providerCode ?? casual.string,
      authorityFullCode: payload.authorityFullCode ?? this.getRandomWord(),
      countryIso2: !this.isUndefined(payload.countryIso2) ? payload.countryIso2 : this.getRandomLetters(2),
      currencyIso3: payload.currencyIso3 ?? this.getRandomLetters(3),
      configs: payload.configs ?? JSON.stringify([{ key: 'key', value: 'value' }]),
    };
  }
}
