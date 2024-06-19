import { Knex } from 'knex';

import {
  BoundedCurrencyToMethodDto,
  CountryAuthorityEntity,
  CountryAuthorityMethodDto,
  CountryAuthorityMethodWithCaIdDto,
  CpTables,
  ProviderMethodDetails,
  ProviderMethodEntity,
  ProviderMethodLimitStats,
  ProviderMethodSettingsUpdateDto,
  ProviderMethodWithCountryAuthority,
  SortOrder,
  TransactionType,
} from '@core';
import { NotFoundError } from '@internal/errors-library';
import { ProviderMethodDto } from '@domains/provider-methods/types';
import { WithdrawalOrderDto } from '@domains/provider-methods';

import { AbstractRepository, SelectByEntityParams } from './abstract-repository';

interface FindWithCountryAuthorityParams {
  countries?: string[];
  authorities?: string[];
}

interface FindWithCountryAuthorityAndMethodParams {
  countryAuthorityMethods: {
    country: string;
    authority: string;
    method: string;
  }[];
}

export type WithdrawalOrderType = 'refundsOrder' | 'payoutsOrder'

export class ProviderMethodRepository extends AbstractRepository<ProviderMethodEntity> {
  protected readonly entity = CpTables.CP_PROVIDER_METHODS;
  private readonly providers = CpTables.CP_PROVIDERS;

  public async getLimitsStats(): Promise<ProviderMethodLimitStats[]> {
    const query = this.queryBuilder
      .from(`${this.entity} as pm`)
      .select(
        `cc.name as countryName`,
        `cc.iso3 as countryIso3`,
        `ca.authorityFullCode`,
        `m.name as methodName`,
        `p.code as providerCode`,
        `tc.type as configsType`,
        `tc.currencyIso3 as configsCurrencyIso3`,
        `tc.minAmount as configsMinAmount`,
        `tc.maxAmount as configsMaxAmount`,
        `tc.isEnabled as configsIsEnabled`,
        `tc.period as configsPeriod`,
        'cam.depositsOrder as depositsOrder',
        `tc.updatedAt as configsUpdatedAt`

      )
      .innerJoin(`${CpTables.CP_PROVIDERS} as p`, 'p.id', 'pm.providerId')
      .innerJoin(`${CpTables.CP_TRANSACTION_CONFIGS} as tc`, 'tc.providerMethodId', 'pm.id')
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .innerJoin(`${CpTables.CP_METHODS} as m`, 'm.id', 'cam.methodId')
      .innerJoin(`${CpTables.CP_COUNTRIES} as cc`, 'cc.iso2', 'ca.countryIso2');

    return await this.executeQuery<ProviderMethodLimitStats[]>(query);
  }

  public async findCABoundedToProvider(providerCode: string): Promise<CountryAuthorityEntity[]> {
    const query = this.queryBuilder
      .from(`${this.entity} as pm`)
      .select(
        'ca.id',
        'ca.countryIso2',
        'ca.authorityFullCode'
      )
      .distinct()
      .innerJoin(`${CpTables.CP_PROVIDERS} as p`, 'p.id', 'pm.providerId')
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .where('p.code', providerCode);

    return await this.executeQuery<CountryAuthorityEntity[]>(query);
  }

  public findRelatedCountryAuthorityMethods(providerId: string, tx?: Knex.Transaction): Promise<CountryAuthorityMethodDto[]> {
    const query = this.queryBuilder
      .from(`${this.entity} as pm`)
      .select(
        'ca.countryIso2 as country',
        'ca.authorityFullCode as authority',
        'm.name as methodName',
        'm.code as methodCode',
        'cam.isEnabled as isEnabled'
      )
      .innerJoin(`${CpTables.CP_PROVIDERS} as p`, 'p.id', 'pm.providerId')
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .innerJoin(`${CpTables.CP_METHODS} as m`, 'm.id', 'cam.methodId')
      .groupBy(['countryAuthorityId', 'methodName', 'methodCode'])
      .orderBy(['ca.authorityFullCode', 'ca.countryIso2', 'm.code', 'm.name'])
      .where('p.id', providerId)
      .modify(q => {
        if (tx) {
          q.transacting(tx);
        }
      });

    return this.executeQuery<CountryAuthorityMethodDto[]>(query);
  }

  public async findBoundedMethods(providerCode: string): Promise<CountryAuthorityMethodWithCaIdDto[]> {
    const query = this.queryBuilder
      .from(`${this.entity} as pm`)
      .select(
        'cam.countryAuthorityId as countryAuthorityId',
        'ca.countryIso2 as country',
        'ca.authorityFullCode as authority',
        'm.name as methodName',
        'm.code as methodCode'
      )
      .innerJoin(`${CpTables.CP_PROVIDERS} as p`, 'p.id', 'pm.providerId')
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .innerJoin(`${CpTables.CP_METHODS} as m`, 'm.id', 'cam.methodId')
      .groupBy(['countryAuthorityId', 'methodName', 'methodCode'])
      .orderBy(['methodCode', 'authority', 'country'])
      .where('p.code', providerCode);

    return await this.executeQuery<CountryAuthorityMethodWithCaIdDto[]>(query);
  }

  public async findBoundedCurrenciesToMethods(providerId: string): Promise<BoundedCurrencyToMethodDto[]> {
    const query = this.queryBuilder
      .select(
        'm.code as methodCode',
        'tc.currencyIso3',
        'ca.authorityFullCode',
        'ca.countryIso2'
      )
      .from(`${this.entity} as pm`)
      .innerJoin(`${CpTables.CP_TRANSACTION_CONFIGS} as tc`, 'tc.providerMethodId', 'pm.id')
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .innerJoin(`${CpTables.CP_METHODS} as m`, 'm.id', 'cam.methodId')
      .where('pm.providerId', providerId)
      .andWhere('tc.type', TransactionType.DEPOSIT)
      .groupBy([1, 2, 3, 4]);

    return await this.executeQuery<BoundedCurrencyToMethodDto[]>(query);
  }

  public async findByCountryAuthorityMethods(
    providerId: string,
    params: FindWithCountryAuthorityAndMethodParams
  ): Promise<ProviderMethodDetails[]> {
    const query = this.queryBuilder
      .select(
        'pm.id',
        'pm.countryAuthorityMethodId',
        'pm.providerId',
        'pm.credentialsId',
        'pm.isEnabled',
        'pm.isPayoutAsRefund',
        'pm.isPaymentAccountRequired',
        'ca.authorityFullCode',
        'ca.countryIso2',
        'm.code as methodCode'
      )
      .from(`${this.entity} as pm`)
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .innerJoin(`${CpTables.CP_METHODS} as m`, 'm.id', 'cam.methodId')
      .where('pm.providerId', providerId)
      .andWhere(qq => {
        params.countryAuthorityMethods.forEach(cam => {
          qq
            .orWhere('m.code', cam.method)
            .andWhere('ca.countryIso2', cam.country)
            .andWhere('ca.authorityFullCode', cam.authority);
        });
      });

    return this.executeQuery<ProviderMethodDetails[]>(query);
  }

  public async findWithCountryAuthority(
    providerId: string,
    params: FindWithCountryAuthorityParams = {},
    order?: string[],
    tx?: Knex.Transaction
  ): Promise<ProviderMethodWithCountryAuthority[]> {
    const query = this.queryBuilder
      .select(
        'pm.id',
        'pm.countryAuthorityMethodId',
        'pm.providerId',
        'pm.credentialsId',
        'pm.isEnabled',
        'pm.isPayoutAsRefund',
        'pm.isPaymentAccountRequired',
        'pm.defaultCurrency',
        'ca.authorityFullCode',
        'ca.countryIso2',
        'm.code as methodCode'
      )
      .from(`${this.entity} as pm`)
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.id', 'pm.countryAuthorityMethodId')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'cam.countryAuthorityId')
      .innerJoin(`${CpTables.CP_METHODS} as m`, 'm.id', 'cam.methodId')
      .where('pm.providerId', providerId)
      .modify(q => {
        if (params.countries) {
          q.whereIn('ca.countryIso2', params.countries);
        }

        if (params.authorities) {
          q.whereIn('ca.authorityFullCode', params.authorities);
        }

        if (order?.length) {
          q.orderBy(order);
        }

        if (tx) {
          q.transacting(tx);
        }
      });

    return this.executeQuery<ProviderMethodWithCountryAuthority[]>(query);
  }

  public async findByCountryAuthorityIdOrThrow(
    countryAuthorityMethodId: string,
    providerCode: string,
    tx: Knex.Transaction
  ): Promise<ProviderMethodEntity | never> {
    const query = this.wrapInTransaction(this.queryBuilder, tx)
      .select(
        `${this.entity}.id`,
        `${this.entity}.countryAuthorityMethodId`,
        `${this.entity}.providerId`,
        `${this.entity}.credentialsId`,
        `${this.entity}.isEnabled`,
        `${this.entity}.isPayoutAsRefund`,
        `${this.entity}.isPaymentAccountRequired`,
        `${this.entity}.defaultCurrency`
      )
      .forUpdate(this.entity)
      .innerJoin(this.providers, `${this.providers}.id`, `${this.entity}.providerId`)
      .where(`${this.entity}.countryAuthorityMethodId`, '=', countryAuthorityMethodId)
      .andWhere(`${this.providers}.code`, '=', providerCode)
      .limit(1)
      .first();

    const result = await this.executeQuery<ProviderMethodEntity>(query);
    if (!result) {
      throw new NotFoundError('Provider method not found', { id: `${countryAuthorityMethodId}:${providerCode}` });
    }

    return result;
  }

  public async upsert(
    payload: Partial<ProviderMethodEntity>,
    searchParams: SelectByEntityParams<ProviderMethodEntity>,
    transaction?: Knex.Transaction
  ): Promise<ProviderMethodEntity> {
    const existingEntity = await this.findOne(searchParams, transaction);
    if (existingEntity) {
      return this.update(existingEntity.id, {
        ...payload,
        id: existingEntity.id,
        isEnabled: existingEntity.isEnabled,
      }, transaction);
    }

    return this.create(payload, transaction);
  }

  public async updateSettings(
    providerId: string,
    payload: ProviderMethodSettingsUpdateDto[],
    tx: Knex.Transaction): Promise<ProviderMethodWithCountryAuthority[]> {
    if (payload.length) {
      await Promise.all(payload.map(async ({ id, ...settings }) => {
        const queryBuilder = this.queryBuilder.update(settings).where('id', id).transacting(tx);

        await queryBuilder;
      }));
    }

    return this.findWithCountryAuthority(providerId, {}, ['countryIso2', 'authorityFullCode'], tx);
  }

  public async findByCA(countryAuthorityId: string, orderType?: WithdrawalOrderType): Promise<ProviderMethodDto[]> {
    return this.queryBuilder
      .select(
        'cp.code as providerCode',
        'cp.name as providerName',
        'cm.code as methodCode',
        'cm.name as methodName'
      )
      .from('cp_providerMethods as cpm')
      .join('cp_countryAuthorityMethods as ccam', 'ccam.id', 'cpm.countryAuthorityMethodId')
      .join('cp_countriesAuthorities as cca', 'cca.id', 'ccam.countryAuthorityId')
      .join('cp_providers as cp', 'cp.id', 'cpm.providerId')
      .join('cp_methods as cm', 'cm.id', 'ccam.methodId')
      .where('cpm.isEnabled', '1')
      .where('cca.id', countryAuthorityId)
      .modify(q => {
        if (orderType) {
          q.orderBy(`cpm.${orderType}`, SortOrder.DESC);
        }

        q.orderBy('cp.code');
      });
  }

  public async updateWithdrawalsOrder(withdrawals: WithdrawalOrderDto[], countryAuthorityId: string): Promise<void> {
    await this.runInTransaction(async tx => {
      for (const w of withdrawals) {
        await this.queryBuilder
          .from('cp_providerMethods as cpm')
          .join('cp_countryAuthorityMethods as ccam', 'ccam.id', 'cpm.countryAuthorityMethodId')
          .join('cp_countriesAuthorities as cca', 'cca.id', 'ccam.countryAuthorityId')
          .join('cp_providers as cp', 'cp.id', 'cpm.providerId')
          .join('cp_methods as cm', 'cm.id', 'ccam.methodId')
          .where('cp.code', w.providerCode)
          .where('cm.code', w.methodCode)
          .where('cca.id', countryAuthorityId)
          .update({ refundsOrder: w.refundsOrder, payoutsOrder: w.payoutsOrder })
          .transacting(tx);
      }
    });
  }
}
