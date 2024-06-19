import { randomUUID } from 'crypto';

import { CountryAuthorityDto, CountryAuthorityEntity } from '@core';

export class CountryAuthorityFactory {
  public static createEntity(countryAuthority: CountryAuthorityDto): CountryAuthorityEntity {
    return {
      id: randomUUID(),
      countryIso2: countryAuthority.country,
      authorityFullCode: countryAuthority.authority,
      adminApiId: null,
    };
  }
}
