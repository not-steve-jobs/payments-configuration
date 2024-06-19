import { Knex } from 'knex';

import { CountryAuthorityEntity, Entity } from '@core';

import { AbstractRepository } from './abstract-repository';

interface BindableEntity extends Entity {
  providerCode: string;
  authorityFullCode: string | null;
  countryIso2: string | null;
}

export abstract class CountryAuthorityBindableRepository<T extends BindableEntity> extends AbstractRepository<T> {
  public async deleteNotInCA(
    providerCode: string,
    countryAuthorities: Pick<CountryAuthorityEntity, 'authorityFullCode' | 'countryIso2'>[],
    tx: Knex.Transaction
  ): Promise<void> {
    const query = this.queryBuilder
      .delete()
      .where(`${this.entity}.providerCode`, providerCode)
      .andWhereNot(q => {
        countryAuthorities.forEach(({ authorityFullCode, countryIso2 }) => {
          q.orWhere({ authorityFullCode, countryIso2 });
        });
      })
      .transacting(tx);

    return this.executeQuery(query);
  }
}
