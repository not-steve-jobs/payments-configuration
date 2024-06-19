import { Knex } from 'knex';

import { AbstractRepository } from '@infra/repos/abstract-repository';
import { CountryAuthorityEntity, CpTables, ProviderRestrictionsEntity } from '@core';
import { ProviderRestrictionsDto } from '@domains/providers';

export class ProviderRestrictionsRepository extends AbstractRepository<ProviderRestrictionsEntity> {
  protected readonly entity = CpTables.CP_PROVIDER_RESTRICTIONS;

  public async deleteNotInCA(providerCode: string, countryAuthorities: Pick<CountryAuthorityEntity, 'id'>[], tx: Knex.Transaction): Promise<void> {
    const query = this.queryBuilder
      .delete()
      .where(`${this.entity}.providerCode`, providerCode)
      .whereNotIn(`${this.entity}.countryAuthorityId`, countryAuthorities.map(({ id }) => id))
      .transacting(tx);

    return this.executeQuery(query);
  }

  public async replaceAllByProviderCode(providerCode: string, data: ProviderRestrictionsEntity[]): Promise<ProviderRestrictionsDto[]> {
    await this.runInTransaction(async tx => {
      await this.queryBuilder.transacting(tx).delete().from(`${this.entity}`).where('providerCode', providerCode);
      if (data.length) {
        await this.queryBuilder.transacting(tx).insert(data);
      }
    });

    return await this.getProviderRestrictions(providerCode);
  }

  public getProviderRestrictions(providerCode: string): Promise<ProviderRestrictionsDto[]> {
    return this.queryBuilder
      .select({
        providerCode: 'pr.providerCode',
        authority: 'ca.authorityFullCode',
        country: 'ca.countryIso2',
        isEnabled: 'pr.isEnabled',
        platform: 'pr.platform',
        settings: 'pr.settings',
      })
      .from(`${this.entity} as pr`)
      .leftJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'pr.countryAuthorityId')
      .where('pr.providerCode', providerCode);
  }

  public async getProviderRestrictionsByPlatformAndCA(platform: string, caId: string): Promise<ProviderRestrictionsDto[]> {
    return this.queryBuilder
      .select({
        providerCode: 'pr.providerCode',
        authority: 'ca.authorityFullCode',
        country: 'ca.countryIso2',
        isEnabled: 'pr.isEnabled',
        platform: 'pr.platform',
        settings: 'pr.settings',
      })
      .from(`${this.entity} as pr`)
      .leftJoin(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.id', 'pr.countryAuthorityId')
      .where('pr.platform', platform)
      .andWhere('ca.id', caId);
  }
}
