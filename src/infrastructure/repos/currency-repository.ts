import { NotFoundError } from '@internal/errors-library';
import { CpTables, CurrencyEntity } from '@core';

import { AbstractRepository } from './abstract-repository';

export class CurrencyRepository extends AbstractRepository<CurrencyEntity> {
  protected readonly entity = CpTables.CP_CURRENCIES;

  public async create(entity: CurrencyEntity): Promise<CurrencyEntity> {
    const queryBuilder = this.queryBuilder.insert(entity);

    await this.executeQuery<void>(queryBuilder);

    return await this.findOne({ iso3: entity.iso3 });
  }

  public async findAllIso3(): Promise<CurrencyEntity[]> {
    const query = this.queryBuilder.select(`${this.entity}.iso3`);

    return this.executeQuery<CurrencyEntity[]>(query);
  }

  public async findOneOrThrow(iso3: string): Promise<CurrencyEntity | never> {
    const currencyEntity = await this.findOne({ iso3 });

    if (!currencyEntity) {
      throw new NotFoundError(`Unknown currency "${iso3}"`, { id: iso3 });
    }

    return currencyEntity;
  }
}
