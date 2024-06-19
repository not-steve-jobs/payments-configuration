import { Knex } from 'knex';

import {
  CountryAuthorityMethodEntity,
  CountryAuthorityMethodWithCodeDto,
  CountryAuthorityMethodWithProvidersEntity,
  CpTables,
  SortOrder,
} from '@core';
import { NotFoundError } from '@internal/errors-library';

import { AbstractRepository } from './abstract-repository';

export class CountryAuthorityMethodRepository extends AbstractRepository<CountryAuthorityMethodEntity> {
  protected readonly entity = CpTables.CP_COUNTRY_AUTHORITY_METHODS;

  public findWithProvidersByCountryAuthority(countryAuthorityId: string): Promise<CountryAuthorityMethodWithProvidersEntity[]> {
    const dataSource = this.dataSource.getDataSource();

    const providersSubQuery = this.queryBuilder
      .select(dataSource.raw('GROUP_CONCAT(p.name SEPARATOR ",")'))
      .from(`${CpTables.CP_PROVIDERS} as p`)
      .leftJoin(`${CpTables.CP_PROVIDER_METHODS} as pm`, `pm.providerId`, `p.id`)
      .whereRaw(`pm.countryAuthorityMethodId = ${this.entity}.id`);

    const query = this.queryBuilder.select(
      `${this.entity}.id`,
      `${this.entity}.isEnabled`,
      `${this.entity}.methodId`,
      `${this.entity}.countryAuthorityId`,
      `${this.entity}.depositsOrder`,
      `m.name as methodName`,
      `m.code as methodCode`
    )
      .select(providersSubQuery.as('providers'))
      .leftJoin(`${CpTables.CP_METHODS} as m`, `${this.entity}.methodId`, `m.id`)
      .where(`${this.entity}.countryAuthorityId`, countryAuthorityId)
      .orderBy(`${this.entity}.isEnabled`,`${SortOrder.DESC}`)
      .orderBy(`${this.entity}.depositsOrder`,`${SortOrder.ASC}`, 'last')
      .orderBy(`${this.entity}.depositsOrder`,`${SortOrder.ASC}`);

    return this.executeQuery<CountryAuthorityMethodWithProvidersEntity[]>(query);
  }

  public async findOneOrThrow(
    countryAuthorityId: string,
    methodCode: string,
    transaction?: Knex.Transaction
  ): Promise<CountryAuthorityMethodEntity | never> {
    const countryAuthorityMethod = await this.findOneByCountryAuthorityAndCode(countryAuthorityId, methodCode, transaction);
    if (!countryAuthorityMethod) {
      throw new NotFoundError('Payment Method not found', { id: `${countryAuthorityId}:${methodCode}` });
    }

    return countryAuthorityMethod;
  }

  public async findByCountryAuthorities(payload: {
    country: string;
    authority: string;
  }, tx: Knex.Transaction): Promise<CountryAuthorityMethodWithCodeDto[]> {
    const query = this.queryBuilder
      .select(
        'cam.id',
        'cam.countryAuthorityId',
        'cam.methodId',
        'cam.isEnabled',
        'cam.depositsOrder',
        `m.code`
      )
      .from(`${this.entity} as cam`)
      .transacting(tx)
      .innerJoin(`${CpTables.CP_METHODS} as m`, 'cam.methodId', 'm.id')
      .innerJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'cam.countryAuthorityId', 'ca.id')
      .where('ca.countryIso2', payload.country)
      .andWhere('ca.authorityFullCode', payload.authority);

    return this.executeQuery<CountryAuthorityMethodWithCodeDto[]>(query);
  }

  private findOneByCountryAuthorityAndCode(
    countryAuthorityId: string,
    methodCode: string,
    transaction?: Knex.Transaction
  ): Promise<CountryAuthorityMethodEntity> {
    const query = this.wrapInTransaction(this.queryBuilder.select(
      `${this.entity}.id`,
      `${this.entity}.isEnabled`,
      `${this.entity}.methodId`,
      `${this.entity}.countryAuthorityId`,
      `${CpTables.CP_METHODS}.code`
    ), transaction)
      .innerJoin(CpTables.CP_METHODS, `${this.entity}.methodId`, `${CpTables.CP_METHODS}.id`)
      .where(`${CpTables.CP_METHODS}.code`, '=', methodCode)
      .andWhere(`${this.entity}.countryAuthorityId`, '=', `${countryAuthorityId}`)
      .limit(1)
      .first();

    return this.executeQuery<CountryAuthorityMethodEntity>(query);
  }
}
