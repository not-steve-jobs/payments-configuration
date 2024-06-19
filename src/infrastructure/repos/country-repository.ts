import { CountryEntity, CpTables } from '@core';
import { CountryWithAuthoritiesDto } from '@core/contracts/dtos/country-with-authorities-dto';
import { AddCountryParams } from '@domains/countries-authorities-methods';

import { AbstractRepository } from './abstract-repository';

interface GetCountriesWithAuthoritiesOptions {
  authorityFullCode?: string;
  providerCode?: string;
}

export class CountryRepository extends AbstractRepository<CountryEntity> {
  protected readonly entity = CpTables.CP_COUNTRIES;

  public async getCountriesWithAuthorities({ authorityFullCode, providerCode }:GetCountriesWithAuthoritiesOptions): Promise<CountryWithAuthoritiesDto[]> {
    const dataSource = this.dataSource.getDataSource();

    const query = this.queryBuilder
      .select(
        'c.iso2',
        'c.name',
        'c.group',
        dataSource.raw('GROUP_CONCAT(DISTINCT a.fullCode ORDER BY a.fullCode SEPARATOR ",") as authorities')
      )
      .from(`${CpTables.CP_COUNTRIES} as c`)
      .join(`${CpTables.CP_COUNTRIES_AUTHORITIES} as ca`, 'ca.countryIso2', 'c.iso2')
      .join(`${CpTables.CP_AUTHORITIES} as a`, 'a.fullCode', 'ca.authorityFullCode')
      .modify(q => {
        if (authorityFullCode) {
          q.where('a.fullCode', authorityFullCode);
        }

        if (providerCode) {
          q
            .join(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.countryAuthorityId', 'ca.id')
            .join(`${CpTables.CP_PROVIDER_METHODS} as pm`, 'pm.countryAuthorityMethodId', 'cam.id')
            .join(`${CpTables.CP_PROVIDERS} as p`, 'p.id', 'pm.providerId')
            .where('p.code', providerCode);
        }
      })
      .groupBy([1,2,3]);

    return this.executeQuery(query);
  }

  public async updateCountry(iso2: string, data: AddCountryParams): Promise<CountryEntity> {
    await this.queryBuilder.update(data).where({ iso2 });

    return this.findOne({ iso2 });
  }

  public async createCountry(entity: Partial<CountryEntity>): Promise<CountryEntity> {
    const queryBuilder = this.queryBuilder.insert(entity);
    await this.executeQuery<void>(queryBuilder);

    const queryBuilderFetch = this.queryBuilder.where({ iso2: entity.iso2 }).first();
    return this.executeQuery<CountryEntity>(queryBuilderFetch);
  }
}
