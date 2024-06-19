import { randomUUID } from 'crypto';

import { CountryAuthorityMethodEntity } from '@core';

export class CountryAuthorityMethodFactory {
  public static createEntityModel(payload: Partial<CountryAuthorityMethodEntity>): CountryAuthorityMethodEntity {
    return {
      id: randomUUID(),
      countryAuthorityId: payload.countryAuthorityId!,
      methodId: payload.methodId!,
      isEnabled: payload.isEnabled ?? false,
      depositsOrder: payload.depositsOrder ?? null,
      createdBy: '',
      updatedBy: '',
    };
  }
}
