import casual from 'casual';
import { Knex } from 'knex';

import { CountryAuthorityMethodWithProvidersEntity, CpTables, DataSource } from '@core/contracts/infrastructure';
import { ILogger } from '@internal/logger-library';
import { CountryAuthorityMethodRepository } from '@infra';
import { countryAuthorityMethodsWithProviders } from '@test/fixtures';

describe('CountryAuthorityMethodRepository', () => {
  describe('#findWithProvidersByCountryAuthority', () => {
    let queryBuilder: Knex.QueryBuilder<CountryAuthorityMethodWithProvidersEntity>;
    let repo: CountryAuthorityMethodRepository;

    beforeEach(() => {
      queryBuilder = mock<Knex.QueryBuilder<CountryAuthorityMethodWithProvidersEntity>>({
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        whereRaw: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        as: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue([]),
      });

      repo = new CountryAuthorityMethodRepository({
        logger: mock<ILogger>({ info: jest.fn(), warning: jest.fn() }),
        dataSource: {
          raw: jest.fn().mockReturnThis(),
          getDataSource: jest.fn().mockReturnThis(),
          queryBuilder: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnValue(queryBuilder),
        } as DataSource<Knex>,
      });
    });

    it('Should return an empty list if got unknown countryAuthority', async () => {
      queryBuilder.then = jest.fn().mockResolvedValue([]);
      const unknownCountryAuthorityId = '123';

      const result = await repo.findWithProvidersByCountryAuthority(unknownCountryAuthorityId);

      expect(queryBuilder.leftJoin).toHaveBeenNthCalledWith(1, `${CpTables.CP_PROVIDER_METHODS} as pm`, `pm.providerId`, `p.id`);
      expect(queryBuilder.select).toHaveBeenNthCalledWith(2,
        `${repo['entity']}.id`,
        `${repo['entity']}.isEnabled`,
        `${repo['entity']}.methodId`,
        `${repo['entity']}.countryAuthorityId`,
        `${repo['entity']}.depositsOrder`,
        `m.name as methodName`,
        `m.code as methodCode`
      );
      expect(queryBuilder.from).toBeCalledOnceWith(`${CpTables.CP_PROVIDERS} as p`);
      expect(queryBuilder.as).toBeCalledOnceWith('providers');
      expect(queryBuilder.select).toHaveBeenNthCalledWith(3, queryBuilder.as('providers'));
      expect(queryBuilder.leftJoin).toHaveBeenNthCalledWith(2, `${CpTables.CP_METHODS} as m`, `${repo['entity']}.methodId`, `m.id`);
      expect(queryBuilder.where).toBeCalledOnceWith(`${repo['entity']}.countryAuthorityId`, unknownCountryAuthorityId);
      expect(queryBuilder.orderBy).toHaveBeenCalledTimes(3);
      expect(result).toStrictEqual([]);
    });

    it('Should return a non-empty array of CountryAuthorityMethods with providers', async () => {
      const countryAuthorityId = casual.uuid;
      queryBuilder.then = jest.fn().mockResolvedValue(countryAuthorityMethodsWithProviders);

      const result = await repo.findWithProvidersByCountryAuthority(countryAuthorityId);

      expect(queryBuilder.where).toBeCalledOnceWith(`${repo['entity']}.countryAuthorityId`, countryAuthorityId);
      expect(result).toStrictEqual(countryAuthorityMethodsWithProviders);
    });
  });

  it('Throws an error in findOneOrThrow if method not found', async () => {
    const countryAuthorityId = casual.uuid;
    const payload = { methodCode: 'UNKNOWN', countryAuthorityId };
    const queryBuilder = mock<Knex.QueryBuilder<CountryAuthorityMethodWithProvidersEntity>>({
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue(undefined),
    });

    const repo = new CountryAuthorityMethodRepository({
      logger: mock<ILogger>({ info: jest.fn(), warning: jest.fn() }),
      dataSource: {
        getDataSource: jest.fn().mockReturnThis(),
        queryBuilder: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnValue(queryBuilder),
      } as DataSource<Knex>,
    });

    await expect(repo.findOneOrThrow(countryAuthorityId, payload.methodCode)).rejects.toThrow('Payment Method not found');
    expect(queryBuilder.where).toBeCalledOnceWith(`${CpTables.CP_METHODS}.code`, '=', payload.methodCode);
    expect(queryBuilder.andWhere).toBeCalledOnceWith(`${repo['entity']}.countryAuthorityId`, '=', payload.countryAuthorityId);
  });

  it('Should return method in findOneOrThrow', async () => {
    const countryAuthorityId = casual.uuid;
    const payload = { methodCode: 'cards', countryAuthorityId };
    const countryAuthorityMethodWithProvidersEntity = mock<CountryAuthorityMethodWithProvidersEntity>({
      id: casual.uuid, countryAuthorityId, methodName: 'Visa/Mastercard', methodCode: payload.methodCode, isEnabled: true,
    });
    const queryBuilder = mock<Knex.QueryBuilder<CountryAuthorityMethodWithProvidersEntity>>({
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue(countryAuthorityMethodWithProvidersEntity),
    });

    const repo = new CountryAuthorityMethodRepository({
      logger: mock<ILogger>({ info: jest.fn(), warning: jest.fn() }),
      dataSource: {
        getDataSource: jest.fn().mockReturnThis(),
        queryBuilder: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnValue(queryBuilder),
      } as DataSource<Knex>,
    });
    const result = await repo.findOneOrThrow(countryAuthorityId, payload.methodCode);

    expect(result).toStrictEqual(countryAuthorityMethodWithProvidersEntity);
    expect(queryBuilder.where).toBeCalledOnceWith(`${CpTables.CP_METHODS}.code`, '=', payload.methodCode);
    expect(queryBuilder.limit).toBeCalledOnceWith(1);
    expect(queryBuilder.first).toHaveBeenCalledTimes(1);
    expect(queryBuilder.andWhere).toBeCalledOnceWith(`${repo['entity']}.countryAuthorityId`, '=', payload.countryAuthorityId);
  });
});
