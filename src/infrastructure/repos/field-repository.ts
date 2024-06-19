import { Knex } from 'knex';

import { ConfigFieldWithOptionDto, CpTables, FieldEntity, FieldEntityType, TransactionType } from '@core';
import { SpecificFieldWithOptionDto } from '@domains/providers/types';

import { AbstractRepository, AbstractRepositoryOptions } from './abstract-repository';
import { ProviderMethodRepository } from './provider-method-repository';

interface FieldRepositoryOptions extends AbstractRepositoryOptions {
  providerMethodRepository: ProviderMethodRepository;
}

interface GetFieldsFilter {
  entityIds: string[];
  entityType?: FieldEntityType;
  transactionType?: TransactionType;
  getOnlyCommonCurrencyFields?: boolean;
  isEnabled?: boolean;
}

export class FieldRepository extends AbstractRepository<FieldEntity> {
  protected readonly entity = CpTables.CP_FIELDS;

  constructor(params: FieldRepositoryOptions) {
    super(params);
  }

  public getOrderedSpecificFieldsWithOptions(providerCode: string): Promise<SpecificFieldWithOptionDto[]> {
    const query = this.queryBuilder
      .select<SpecificFieldWithOptionDto[]>(
        { authority: `${CpTables.CP_COUNTRIES_AUTHORITIES}.authorityFullCode` },
        { country: `${CpTables.CP_COUNTRIES_AUTHORITIES}.countryIso2` },
        { currency: `${this.entity}.currencyIso3` },
        `${this.entity}.key`,
        `${this.entity}.value`,
        `${this.entity}.valueType`,
        `${this.entity}.isEnabled`,
        `${this.entity}.isMandatory`,
        `${this.entity}.transactionType`,
        `${this.entity}.defaultValue`,
        `${this.entity}.pattern`,
        { optionKey: `${CpTables.CP_FIELD_OPTIONS}.key` },
        { optionValue: `${CpTables.CP_FIELD_OPTIONS}.value` },
        { optionIsEnabled: `${CpTables.CP_FIELD_OPTIONS}.isEnabled` }
      )
      .join(CpTables.CP_PROVIDER_METHODS, `${CpTables.CP_PROVIDER_METHODS}.id`, `${CpTables.CP_FIELDS}.entityId`)
      .join(CpTables.CP_PROVIDERS, `${CpTables.CP_PROVIDERS}.id`, `${CpTables.CP_PROVIDER_METHODS}.providerId`)
      .join(CpTables.CP_COUNTRY_AUTHORITY_METHODS,`${CpTables.CP_COUNTRY_AUTHORITY_METHODS}.id`, `${CpTables.CP_PROVIDER_METHODS}.countryAuthorityMethodId`)
      .join(CpTables.CP_COUNTRIES_AUTHORITIES, `${CpTables.CP_COUNTRIES_AUTHORITIES}.id`, `${CpTables.CP_COUNTRY_AUTHORITY_METHODS}.countryAuthorityId`)
      .leftJoin(CpTables.CP_FIELD_OPTIONS, `${this.entity}.id`, `${CpTables.CP_FIELD_OPTIONS}.fieldId`)
      .where(`${CpTables.CP_PROVIDERS}.code`, providerCode)
      .andWhere(`${this.entity}.entityType`, FieldEntityType.PROVIDER_METHOD)
      .orderBy([
        `${CpTables.CP_COUNTRIES_AUTHORITIES}.authorityFullCode`,
        `${CpTables.CP_COUNTRIES_AUTHORITIES}.countryIso2`,
        `${this.entity}.currencyIso3`,
        `${this.entity}.key`,
        `${this.entity}.transactionType`,
        `${CpTables.CP_FIELD_OPTIONS}.key`,
      ]);
    return this.executeQuery(query);
  }

  public async findFieldsWithOptions(filter: GetFieldsFilter): Promise<ConfigFieldWithOptionDto[]> {
    const query = this.queryBuilder
      .leftJoin(
        CpTables.CP_FIELD_OPTIONS,
        `${CpTables.CP_FIELD_OPTIONS}.fieldId`,
        `${this.entity}.id`
      )
      .select<ConfigFieldWithOptionDto[]>(
        `${this.entity}.id`,
        `${this.entity}.entityId`,
        `${this.entity}.entityType`,
        `${this.entity}.key`,
        `${this.entity}.value`,
        `${this.entity}.valueType`,
        `${this.entity}.isEnabled`,
        `${this.entity}.isMandatory`,
        `${this.entity}.transactionType`,
        `${this.entity}.pattern`,
        `${this.entity}.defaultValue`,
        `${this.entity}.currencyIso3`,
        { optionId: `${CpTables.CP_FIELD_OPTIONS}.id` },
        { optionKey: `${CpTables.CP_FIELD_OPTIONS}.key` },
        { optionValue: `${CpTables.CP_FIELD_OPTIONS}.value` },
        { optionIsEnabled: `${CpTables.CP_FIELD_OPTIONS}.isEnabled` }
      )
      .whereIn('entityId', filter.entityIds)
      .orderBy([
        `${this.entity}.key`,
        `${this.entity}.transactionType`,
        `${CpTables.CP_FIELD_OPTIONS}.key`,
      ]);

    if (filter.entityType) {
      query.where(`${this.entity}.entityType`, filter.entityType);
    }

    if (filter.transactionType) {
      query.where(`${this.entity}.transactionType`, filter.transactionType);
    }

    if (filter.getOnlyCommonCurrencyFields) {
      query.where(builder => {
        builder
          .where(`${this.entity}.currencyIso3`, '')
          .orWhereNull(`${this.entity}.currencyIso3`);
      });
    }

    if ('isEnabled' in filter) {
      query.where(`${this.entity}.isEnabled`, filter.isEnabled);
    }

    return this.executeQuery<ConfigFieldWithOptionDto[]>(query);
  };

  public removeProviderMethodFields(providerMethodIds: string[], tx: Knex.Transaction): Promise<void> {
    const query = this.queryBuilder
      .delete()
      .whereIn(`${this.entity}.entityId`, providerMethodIds)
      .andWhere(`${this.entity}.entityType`, FieldEntityType.PROVIDER_METHOD)
      .transacting(tx);

    return this.executeQuery(query);
  }

  public async upsert(
    entityIds: string[],
    entityType: FieldEntityType,
    fields: FieldEntity[],
    tx: Knex.Transaction,
    chunkSize = 10000
  ): Promise<FieldEntity[]> {
    const rmQuery = this.queryBuilder
      .transacting(tx)
      .delete()
      .whereIn(`${this.entity}.entityId`, entityIds)
      .andWhere(`${this.entity}.entityType`, entityType);

    await this.executeQuery(rmQuery);

    if (fields.length) {
      await this.batchInsert(fields, tx, chunkSize);

      return this.findAll({ params: { id: fields.map(({ id }) => id) } }, tx);
    }

    return this.findAll({ params: { entityType, entityId: entityIds } }, tx);
  }

  public async upsertCommonFields(providerId: string, fields: FieldEntity[], tx: Knex.Transaction): Promise<FieldEntity[]> {
    return this.upsert([providerId], FieldEntityType.PROVIDER, fields, tx);
  }

  public async deleteAllSpecificFields(providerId: string, tx: Knex.Transaction): Promise<void> {
    const query = this.queryBuilder
      .delete()
      .innerJoin(`${CpTables.CP_PROVIDER_METHODS} as pm`, `${this.entity}.entityId`, 'pm.id')
      .innerJoin(`${CpTables.CP_PROVIDERS} as p`, 'pm.providerId', 'p.id')
      .where(`${this.entity}.entityType`, FieldEntityType.PROVIDER_METHOD)
      .andWhere('p.id', providerId)
      .transacting(tx);

    await this.executeQuery(query);
  }
}
