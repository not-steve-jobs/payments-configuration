import casual from 'casual';

import { DbTable } from '@internal/component-test-library';
import { CredentialEntity } from '@core';

import { Builder } from './abstract-builder';

export class CredentialBuilder extends Builder<CredentialEntity> {
  public tableName = DbTable.cpCredentials;

  protected getNewEntity(payload: Partial<CredentialEntity>): CredentialEntity {
    return {
      providerCode: payload.providerCode || this.getRandomWord(16),
      authorityFullCode: this.getValueOrDefault(payload.authorityFullCode, null),
      countryIso2: this.getValueOrDefault(payload.countryIso2, null),
      currencyIso3: this.getValueOrDefault(payload.currencyIso3, null),
      credentialsDetails: payload.credentialsDetails ?? JSON.stringify([{ key: casual.string, value: casual.string }]),
    };
  }
}
