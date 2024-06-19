import { Knex } from 'knex/types';

import { ILogger } from '@internal/logger-library';
import { DataSource, Entity } from '@core';

export type SelectByEntityParams<T> = Partial<{
  [P in keyof T]: T[P] | Array<T[P]>;
}>

export interface AbstractRepositoryOptions {
  logger: ILogger;
  dataSource: DataSource<Knex>;
}

interface FindFilter<T> {
  params?: SelectByEntityParams<T>;
  order?: string[];
}

export abstract class AbstractRepository<T extends Entity> {
  protected readonly dataSource: DataSource<Knex>;
  protected readonly logger: ILogger;
  protected abstract readonly entity: string;

  constructor({ logger, dataSource }: AbstractRepositoryOptions) {
    this.logger = logger;
    this.dataSource = dataSource;
  }

  protected get queryBuilder(): Knex.QueryBuilder {
    return this.dataSource.getDataSource().queryBuilder().from(this.entity);
  }

  public async findOne(params: SelectByEntityParams<T>, transaction?: Knex.Transaction): Promise<T> {
    const queryBuilder = this.wrapInTransaction(this.buildSelectQuery(params), transaction).first();

    return await this.executeQuery<T>(queryBuilder);
  }

  public async findAll(findFilter: FindFilter<T> = { }, transaction?: Knex.Transaction): Promise<T[]> {
    const queryBuilder = this.buildSelectQuery(findFilter?.params || {}).modify(q => {
      if (findFilter?.order?.length) {
        q.orderBy(findFilter.order);
      }

      if (transaction) {
        q.transacting(transaction);
      }
    });

    return this.executeQuery<T[]>(queryBuilder);
  }

  public async count(params: SelectByEntityParams<T>, transaction?: Knex.Transaction): Promise<number> {
    const queryBuilder = this.wrapInTransaction(this.buildSelectQuery(params), transaction)
      .count({ count: '*' })
      .first();

    const { count } = await this.executeQuery<{ count: number }>(queryBuilder);

    return count;
  }

  public async create(entity: Partial<T>, transaction?: Knex.Transaction): Promise<T> {
    const queryBuilder = this.wrapInTransaction(this.queryBuilder.insert(entity), transaction);

    await this.executeQuery<void>(queryBuilder);

    return await this.findOne({ id: entity.id } as SelectByEntityParams<T>, transaction);
  }

  public async batchInsert(entities: Partial<T>[], tx: Knex.Transaction, chunkSize = 10000): Promise<void> {
    await this.dataSource.getDataSource()
      // eslint-disable-next-line
      .batchInsert(this.entity, entities as any[], chunkSize)
      .transacting(tx);
  }

  public async createList(entities: Partial<T>[], transaction: Knex.Transaction, chunkSize = 10000): Promise<T[]> {
    if (!entities.length) {
      return [];
    }

    await this.batchInsert(entities, transaction, chunkSize);

    return this.findAll({
      params: {
        id: entities.map(({ id }) => id),
      } as SelectByEntityParams<T>,
    }, transaction);
  }

  public async update(id: string, entity: Partial<T>, transaction?: Knex.Transaction): Promise<T> {
    const queryBuilder = this.wrapInTransaction(this.queryBuilder.update(entity), transaction).where({ id });

    await this.executeQuery<void>(queryBuilder);

    return await this.findOne({ id } as SelectByEntityParams<T>, transaction);
  }

  public async remove(id: string | string[], transaction?: Knex.Transaction): Promise<void> {
    const queryBuilder = this.wrapInTransaction(this.queryBuilder.del(), transaction);

    if (Array.isArray(id)) {
      queryBuilder.whereIn(`${this.entity}.id`, id);
    } else {
      queryBuilder.where({ id });
    }

    await this.executeQuery<void>(queryBuilder);
  }

  protected wrapInTransaction(
    queryBuilder: Knex.QueryBuilder<Record<string, unknown>, T>,
    transaction?: Knex.Transaction): Knex.QueryBuilder<Record<string, unknown>, T> {
    return transaction ? queryBuilder.transacting(transaction) : queryBuilder;
  }

  protected buildSelectQuery(params: SelectByEntityParams<T>): Knex.QueryBuilder<Record<string, unknown>, T> {
    return Object.entries(params).reduce((query, [key, value]) => {
      const field = `${this.entity}.${[key]}`;
      if (Array.isArray(value)) {
        query.whereIn(field, value as Knex.Value[]);
      } else if (typeof value !== 'undefined') {
        query.where({ [field]: value });
      }

      return query;
    }, this.queryBuilder);
  }

  protected async executeQuery<TQueryResult>(query: Knex.QueryBuilder): Promise<TQueryResult> {
    const timeStart = new Date();
    this.logger.info('Execute query - start', { query: query.toString() });
    return query
      .then(data => {
        this.logger.info('Execute query - finish',
          { query: query.toString().slice(0, 100), result: {} },
          { timeMs: new Date().getTime() - timeStart.getTime() }
        );
        return data;
      });
  }

  public async runInTransaction<TResponse>(cb: (tx: Knex.Transaction) => Promise<TResponse>): Promise<TResponse> {
    const tx = await this.dataSource.getDataSource().transaction();

    let response: TResponse;

    try {
      response = await cb(tx);

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }

    return response;
  };
}
