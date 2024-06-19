import casual from 'casual';
import { Knex } from 'knex';

import { CountryAuthorityMethodWithProvidersEntity, DataSource } from '@core';
import { NotFoundError } from '@internal/errors-library';
import { ILogger } from '@internal/logger-library';

import { ProviderMethodRepository } from './provider-method-repository';

const generateRepo = (queryBuilder: Knex.QueryBuilder): ProviderMethodRepository => new ProviderMethodRepository({
  logger: mock<ILogger>({ info: jest.fn(), warning: jest.fn() }),
  dataSource: {
    getDataSource: jest.fn().mockReturnThis(),
    queryBuilder: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnValue(queryBuilder),
  } as DataSource<Knex>,
});

const tx: Knex.Transaction = mock<Knex.Transaction>({});


describe('ProviderMethodRepository', () => {
  describe('findOneOrThrow', () => {
    const generateQueryBuilder = (expectedResult: unknown): Knex.QueryBuilder => mock<Knex.QueryBuilder<CountryAuthorityMethodWithProvidersEntity>>({
      transacting: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      forUpdate: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue(expectedResult),
    });

    it('Should return the provider method entity when found', async () => {
      const countryAuthorityMethodId = casual.uuid;
      const code = 'cards';
      const expectedResult = {
        id: countryAuthorityMethodId,
        countryAuthorityMethodId,
        providerId: casual.uuid,
        credentialsId: null,
        isEnabled: true,
      };
      const queryBuilder = generateQueryBuilder(expectedResult);
      const repo = generateRepo(queryBuilder);

      const result = await repo.findByCountryAuthorityIdOrThrow(countryAuthorityMethodId, code, tx);

      expect(result).toEqual(expectedResult);
      expect(queryBuilder.select).toBeCalledOnceWith(`${repo['entity']}.id`,
        `${repo['entity']}.countryAuthorityMethodId`,
        `${repo['entity']}.providerId`,
        `${repo['entity']}.credentialsId`,
        `${repo['entity']}.isEnabled`,
        `${repo['entity']}.isPayoutAsRefund`,
        `${repo['entity']}.isPaymentAccountRequired`,
        `${repo['entity']}.defaultCurrency`
      );
      expect(queryBuilder.forUpdate).toHaveBeenCalled();
      expect(queryBuilder.innerJoin).toBeCalledOnceWith(repo['providers'], `${repo['providers']}.id`, `${repo['entity']}.providerId`);
      expect(queryBuilder.where).toBeCalledOnceWith(`${repo['entity']}.countryAuthorityMethodId`, '=', countryAuthorityMethodId);
      expect(queryBuilder.andWhere).toBeCalledOnceWith(`${repo['providers']}.code`, '=', code);
      expect(queryBuilder.limit).toBeCalledOnceWith(1);
      expect(queryBuilder.first).toHaveBeenCalled();
    });

    it('Should throw a NotFoundError when provider method is not found', async () => {
      const countryAuthorityMethodId = casual.uuid;
      const code = 'cards';

      const queryBuilder = generateQueryBuilder(undefined);
      const repo = generateRepo(queryBuilder);

      await expect(repo.findByCountryAuthorityIdOrThrow(countryAuthorityMethodId, code, tx)).rejects.toThrow(NotFoundError);
    });
  });
});
