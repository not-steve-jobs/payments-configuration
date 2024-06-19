import { Knex } from 'knex';

import { CountryAuthorityEntity, CpTables, ProviderFieldsEntity } from '@core';

import { AbstractRepository } from './abstract-repository';

export class ProviderFieldRepository extends AbstractRepository<ProviderFieldsEntity> {
  protected readonly entity = CpTables.CP_PROVIDER_FIELDS;

  public async findOrdered(providerCode: string): Promise<ProviderFieldsEntity[]> {
    return this.findAll({
      params: { providerCode },
      order: ['countryIso2', 'authorityFullCode', 'transactionType', 'currencyIso3'],
    });
  }

  public async upsert(providerCode: string, entities: ProviderFieldsEntity[]): Promise<void> {
    await this.runInTransaction(async tx => {
      const delQuery = this.queryBuilder
        .where({ providerCode })
        .del()
        .transacting(tx);

      await this.executeQuery(delQuery);

      await this.batchInsert(entities, tx);
    });
  }

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
