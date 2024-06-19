import { Knex } from 'knex';

import { CpTables, ProviderBaseDto, ProviderEntity } from '@core';
import { BaseError, ConflictError, NotFoundError } from '@internal/errors-library';

import { AbstractRepository, SelectByEntityParams } from './abstract-repository';

export class ProviderRepository extends AbstractRepository<ProviderEntity> {
  protected readonly entity = CpTables.CP_PROVIDERS;

  public async findAllBaseProviders(): Promise<ProviderBaseDto[]> {
    return this.queryBuilder.select('code', 'name', 'isEnabled').orderBy('name');
  }

  public async findOneOrThrow(params: SelectByEntityParams<ProviderEntity>): Promise<ProviderEntity> {
    const providerEntity = await this.findOne(params);
    if (!providerEntity) {
      throw new NotFoundError('Unknown Provider', { id: JSON.stringify(params) });
    }

    return providerEntity;
  }

  public async createOrUpdate(payload: ProviderEntity, transaction?: Knex.Transaction): Promise<ProviderEntity> {
    try {
      const existingProvider = await this.findOne({ code: payload.code }, transaction);
      if (existingProvider) {
        return await this.update(existingProvider.id, { name: payload.name }, transaction);
      }

      return await this.create(payload, transaction);
    } catch (err: unknown) {
      const e = err as BaseError;
      this.logger.warning(e.message);
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('Provider name must be unique', { id: { name: payload.name } });
      }

      throw e;
    }
  }
}
