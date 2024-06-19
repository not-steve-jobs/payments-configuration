import { CountryAuthorityDto } from '@core';

import { CountryAuthorityFactory } from './country-authority-factory';

describe('CountryAuthorityFactory', () => {
  it('Should create entity', () => {
    const countryAuthority: CountryAuthorityDto = { country: 'CY', authority: 'CYSEC' };

    expect(CountryAuthorityFactory.createEntity(countryAuthority)).toStrictEqual({
      id: expect.any(String),
      countryIso2: countryAuthority.country,
      authorityFullCode: countryAuthority.authority,
      adminApiId: null,
    });
  });
});
