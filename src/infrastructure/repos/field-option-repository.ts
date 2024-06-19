import { Knex } from 'knex';

import { CpTables, FieldOptionEntity } from '@core';

import { AbstractRepository } from './abstract-repository';


export class FieldOptionRepository extends AbstractRepository<FieldOptionEntity> {
  protected readonly entity = CpTables.CP_FIELD_OPTIONS;

  public async createOrUpdate(
    payload: FieldOptionEntity,
    searchParams: Partial<FieldOptionEntity>,
    tx: Knex.Transaction
  ): Promise<FieldOptionEntity> {
    const existingFieldOption = await this.findOne(searchParams, tx);

    return existingFieldOption
      ? this.update(existingFieldOption.id, {
        ...payload,
        id: existingFieldOption.id,
      }, tx)
      : this.create(payload, tx);
  }
}
