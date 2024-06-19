import { CountryAuthorityDto, CountryAuthorityEntity, CpTables } from '@core';
import { NotFoundError } from '@internal/errors-library';

import { AbstractRepository } from './abstract-repository';

export class CountryAuthorityRepository extends AbstractRepository<CountryAuthorityEntity> {
  protected readonly entity = CpTables.CP_COUNTRIES_AUTHORITIES;

  public async findOneOrThrow(
    authorityFullCode: string,
    countryIso2: string
  ): Promise<CountryAuthorityEntity | never> {
    const countryAuthority = await this.findOne({ authorityFullCode, countryIso2 });
    if (!countryAuthority) {
      throw new NotFoundError('Country\'s authority not found', { id: `${countryIso2}:${authorityFullCode}` });
    }

    return countryAuthority;
  }

  public async findByCountriesAuthoritiesOrThrow(payload: CountryAuthorityDto[]): Promise<CountryAuthorityEntity[] | never> {
    if (!payload.length) {
      return [];
    }

    const countryAuthoritiesUniqueList = Object.values(payload.reduce((acc, next) => {
      acc[`${next.country}:${next.authority}`] = next;
      return acc;
    }, {} as Record<string, { country: string; authority: string }>));

    const query = this.queryBuilder
      .select(`${this.entity}.id`, `${this.entity}.countryIso2`, `${this.entity}.authorityFullCode`)
      .where(builder => {
        countryAuthoritiesUniqueList.forEach(({ country, authority }) => {
          builder
            .orWhere(`${this.entity}.countryIso2`, country)
            .andWhere(`${this.entity}.authorityFullCode`, authority);
        });
      });

    const entities = await this.executeQuery<CountryAuthorityEntity[]>(query);

    if (entities.length !== Object.keys(countryAuthoritiesUniqueList).length) {
      const notFoundedCountryAuthority = payload
        .find(p => !entities.find(e =>
          e.countryIso2.toLowerCase() === p.country.toLowerCase()
          && e.authorityFullCode.toLowerCase() === p.authority.toLowerCase()));

      throw new NotFoundError('Unknown country-authority', {
        id: `${notFoundedCountryAuthority?.country}:${notFoundedCountryAuthority?.authority}`,
      });
    }

    return entities;
  }

  public findRelatedToProvider(providerId: string): Promise<CountryAuthorityEntity[]> {
    const query = this.queryBuilder
      .select(
        'ca.id',
        'ca.countryIso2',
        'ca.authorityFullCode'
      )
      .distinct()
      .from(`${this.entity} as ca`)
      .innerJoin(`${CpTables.CP_COUNTRY_AUTHORITY_METHODS} as cam`, 'cam.countryAuthorityId', 'ca.id')
      .innerJoin(`${CpTables.CP_PROVIDER_METHODS} as pm`, 'pm.countryAuthorityMethodId', 'cam.id')
      .where('pm.providerId', providerId);

    return this.executeQuery<CountryAuthorityEntity[]>(query);
  }
}
