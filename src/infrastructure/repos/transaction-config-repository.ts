import { Knex } from 'knex';

import { CpTables, SortOrder, TransactionConfigDto, TransactionConfigEntity, TransactionType } from '@core';

import { AbstractRepository } from './abstract-repository';

interface GetProviderTransactionConfigsFilter {
  authority: string;
  country: string;
  methodCode?: string;
  transactionType?: TransactionType;
  isCamAndPmEnabled?: boolean;
  isTransactionsConfigEnabled?: boolean;
  includeEmptyConfigs?: boolean;
}

interface RemoveAllParams {
  providerMethodIds: string[];
  exclude?: {
    ids: string[];
  };
}

export class TransactionConfigRepository extends AbstractRepository<TransactionConfigEntity> {
  protected readonly entity = CpTables.CP_TRANSACTION_CONFIGS;

  public findByProviderMethodId(providerMethodId: string, tx: Knex.Transaction): Promise<TransactionConfigEntity[]> {
    const query = this.wrapInTransaction(this.queryBuilder, tx).select(
      `${this.entity}.id`,
      `${this.entity}.providerMethodId`,
      `${this.entity}.currencyIso3`,
      `${this.entity}.type`,
      `${this.entity}.isEnabled`,
      `${this.entity}.minAmount`,
      `${this.entity}.maxAmount`,
      `${this.entity}.order`
    )
      .forUpdate(this.entity)
      .where(`${this.entity}.providerMethodId`, '=', providerMethodId);

    return this.executeQuery<TransactionConfigEntity[]>(query);
  }

  public async bulkUpdate(entities: TransactionConfigEntity[], tx?: Knex.Transaction): Promise<void> {
    const query = this.queryBuilder
      .insert(entities)
      .onConflict()
      .merge(['isEnabled', 'minAmount', 'maxAmount', 'period', 'order'])
      .modify(q => {
        if (tx) {
          q.transacting(tx);
        }
      });

    await query;
  }

  public getProviderTransactionConfigs(filter: GetProviderTransactionConfigsFilter): Promise<TransactionConfigDto[]> {
    const configsJoinType: keyof Pick<Knex.QueryBuilder, 'leftJoin' | 'innerJoin'> = filter.includeEmptyConfigs ? 'leftJoin' : 'innerJoin';

    const query = this.queryBuilder
      .select(
        'm.code as methodCode',
        'm.name as methodName',
        'p.id as providerId',
        'p.code as providerCode',
        'p.name as providerName',
        'p.type as providerType',
        'pm.id as providerMethodId',
        'pm.isEnabled as isProviderMethodEnabled',
        'pm.isPaymentAccountRequired as isPaymentAccountRequired',
        'pm.isPayoutAsRefund as isPayoutAsRefund',
        'pm.defaultCurrency',
        'pm.refundsOrder',
        'pm.payoutsOrder',
        'currencyIso3',
        'tc.type',
        'minAmount',
        'maxAmount',
        'period',
        'order',
        'tc.isEnabled as isEnabled',
        'p.convertedCurrency as convertedCurrency'
      )
      .from(`${CpTables.CP_PROVIDER_METHODS} as pm`)
      [configsJoinType](`${CpTables.CP_TRANSACTION_CONFIGS} as tc`, 'pm.id', 'tc.providerMethodId')
      .leftJoin(`${CpTables.CP_PROVIDERS} as p`, 'p.id', 'pm.providerId')
      .leftJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .leftJoin(`${CpTables.CP_METHODS} as m`, 'm.id', 'cam.methodId')
      .leftJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .where('authorityFullCode', filter.authority)
      .andWhere('countryIso2',  filter.country)
      .orderBy('cam.depositsOrder',`${SortOrder.ASC}`, 'last')
      .orderBy('cam.depositsOrder',`${SortOrder.ASC}`)
      .modify(c => {
        if (filter.isCamAndPmEnabled) {
          c.andWhere('cam.isEnabled', filter.isCamAndPmEnabled)
            .andWhere('pm.isEnabled', filter.isCamAndPmEnabled);
        }
        if (filter.isTransactionsConfigEnabled) {
          c.andWhere('tc.isEnabled', filter.isTransactionsConfigEnabled);
        }
        if (filter.methodCode) {
          c.andWhere('m.code', filter.methodCode);
        }
        if (filter.transactionType) {
          c.andWhere('tc.type', filter.transactionType);
        }
      });

    return this.executeQuery<TransactionConfigDto[]>(query);
  }

  public removeAll(params: RemoveAllParams, tx: Knex.Transaction): Promise<void> {
    const query = this.wrapInTransaction(this.queryBuilder, tx)
      .delete()
      .whereIn(`${this.entity}.providerMethodId`, params.providerMethodIds)
      .modify(q => {
        if (params.exclude?.ids) {
          q.whereNotIn('id', params.exclude.ids);
        }
      });

    return this.executeQuery<void>(query);
  }
}
