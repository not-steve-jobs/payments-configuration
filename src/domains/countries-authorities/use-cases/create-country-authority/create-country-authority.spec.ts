import { CountryAuthorityDto } from '@core';

import { CreateCountryAuthority, CreateCountryAuthorityOptions } from './create-country-authority';

describe('CreateCountryAuthority', () => {
  it('Should create country authority', async () => {
    const countryAuthority: CountryAuthorityDto = { authority: 'CYSEC', country: 'CY' };
    const options = mock<CreateCountryAuthorityOptions>({
      authorityRepository: { findOne: jest.fn().mockResolvedValue({}) },
      countryRepository: { findOne: jest.fn().mockResolvedValue({}) },
      countryAuthorityRepository: {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          authorityFullCode: countryAuthority.authority,
          countryIso2: countryAuthority.country,
        }),
      },
    });

    const service = new CreateCountryAuthority(options);

    expect(await service.execute(countryAuthority)).toStrictEqual(countryAuthority);
  });
});
