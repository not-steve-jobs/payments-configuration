import casual from 'casual';
import { Knex } from 'knex';

import { CountryEntity, DataSource } from '@core';
import { ILogger } from '@internal/logger-library';

import { AbstractRepository, AbstractRepositoryOptions } from './abstract-repository';

interface StubEntity {
  id: string;
}

describe('AbstractRepository', () => {
  it('Should throw error if handle unknown error', async () => {
    const queryBuilder = mock<Knex.QueryBuilder<CountryEntity>>(
      Object.assign(
        {
          where: jest.fn().mockReturnThis(),
          then: jest.fn().mockRejectedValue(new Error('UNKNOWN')),
          first: jest.fn().mockReturnThis(),
        },
        { toString: jest.fn().mockReturnValue('') }
      )
    );

    const options: AbstractRepositoryOptions = {
      logger: mock<ILogger>({
        info: jest.fn(),
        warning: jest.fn(),
      }),
      dataSource: {
        getDataSource: jest.fn().mockReturnThis(),
        queryBuilder: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnValue(queryBuilder),
      } as DataSource<Knex>,
    };

    const repo = new (class extends AbstractRepository<StubEntity> {
      protected readonly entity = 'test';
    })(options);

    await expect(repo.findOne({ id: '123' })).rejects.toThrow('UNKNOWN');
  });

  it('Should execute findOne successfully', async () => {
    const queryBuilder = mock<Knex.QueryBuilder<CountryEntity>>(
      Object.assign(
        {
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockReturnThis(),
          then: jest.fn().mockImplementation(cb => ({
            catch: jest.fn(cb()),
          })),
          catch: jest.fn(),
        },
        { toString: jest.fn().mockReturnValue('') }
      )
    );

    const options: AbstractRepositoryOptions = {
      logger: mock<ILogger>({
        info: jest.fn(),
        warning: jest.fn(),
      }),
      dataSource: {
        getDataSource: jest.fn().mockReturnThis(),
        queryBuilder: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnValue(queryBuilder),
      } as DataSource<Knex>,
    };

    const repo = new (class extends AbstractRepository<StubEntity> {
      protected readonly entity = 'test';
    })(options);

    await repo.findOne({ id: '123' });

    expect(queryBuilder.where).toBeCalledOnceWith({ 'test.id': '123' });
    expect(options.logger.info).toHaveBeenCalledTimes(2);
    expect(queryBuilder.then).toHaveBeenCalled();
  });

  describe('#remove', () => {
    it('Should work with array of ids', async () => {
      const queryBuilder = mock<Knex.QueryBuilder<StubEntity>>({
        del: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        whereIn: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue([]),
      });
      const options: AbstractRepositoryOptions = {
        logger: mock<ILogger>({ info: jest.fn(), warning: jest.fn() }),
        dataSource: {
          getDataSource: jest.fn().mockReturnThis(),
          queryBuilder: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnValue(queryBuilder),
        } as DataSource<Knex>,
      };
      const repo = new (class extends AbstractRepository<StubEntity> {
        protected readonly entity = 'test';
      })(options);
      const ids = [casual.uuid, casual.uuid, casual.uuid];

      await repo.remove(ids);

      expect(queryBuilder.whereIn).toBeCalledOnceWith(`test.id`, ids);
    });
  });
});
