import casual from 'casual';
import { Knex } from 'knex';

import { ILogger } from '@internal/logger-library';
import { DataSource, TransactionConfigEntity } from '@core';
import { TransactionConfigRepository } from '@infra';
import { eurCurrency, usdCurrency } from '@test/fixtures';

const providerMethodId = casual.uuid;
const transactionConfig1 = mock<TransactionConfigEntity>({
  id: casual.uuid,
  providerMethodId,
  currencyIso3: usdCurrency.iso3,
  type: 'deposit',
  isEnabled: true,
  minAmount: 10.0000,
  maxAmount: 100.0000,
});
const transactionConfig2 =  mock<TransactionConfigEntity>({
  id: casual.uuid,
  providerMethodId,
  currencyIso3: eurCurrency.iso3,
  type: 'payout',
  isEnabled: false,
  minAmount: 20.0000,
  maxAmount: 200.0000,
});

const generateRepo = (
  queryBuilder: Knex.QueryBuilder<TransactionConfigEntity>
): TransactionConfigRepository => new TransactionConfigRepository({
  logger: mock<ILogger>({ info: jest.fn(), warning: jest.fn() }),
  dataSource: {
    getDataSource: jest.fn().mockReturnThis(),
    queryBuilder: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnValue(queryBuilder),
  } as DataSource<Knex>,
});

const tx = mock<Knex.Transaction>({});

describe('ProviderMethodTransactionConfigRepository', () => {
  describe('findByProviderMethodId', () => {
    const generateFindByProviderMethodIdQueryBuilder = (
      expectedResult: unknown
    ): Knex.QueryBuilder<TransactionConfigEntity> => mock<Knex.QueryBuilder<TransactionConfigEntity>>({
      select: jest.fn().mockReturnThis(),
      forUpdate: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      transacting: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue(expectedResult),
    });

    it('should return an array of provider method transaction config entities', async () => {
      const expectedResult = [transactionConfig1, transactionConfig2];
      const queryBuilder = generateFindByProviderMethodIdQueryBuilder(expectedResult);
      const repo = generateRepo(queryBuilder);

      const result = await repo.findByProviderMethodId(providerMethodId, tx);

      expect(result).toEqual(expectedResult);
      expect(queryBuilder.select).toBeCalledOnceWith(
        `${repo['entity']}.id`,
        `${repo['entity']}.providerMethodId`,
        `${repo['entity']}.currencyIso3`,
        `${repo['entity']}.type`,
        `${repo['entity']}.isEnabled`,
        `${repo['entity']}.minAmount`,
        `${repo['entity']}.maxAmount`,
        `${repo['entity']}.order`
      );
      expect(queryBuilder.forUpdate).toBeCalledOnceWith(`${repo['entity']}`);
      expect(queryBuilder.where).toBeCalledOnceWith(`${repo['entity']}.providerMethodId`, '=', providerMethodId);
    });
  });
});
