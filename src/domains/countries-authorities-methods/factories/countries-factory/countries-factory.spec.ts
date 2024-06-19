import { CountryWithAuthoritiesDto } from '@core';
import { CountryWithAuthorities } from '@domains/countries-authorities-methods';

import { CountriesFactory } from './countries-factory';

describe('CountriesFactory', () => {

  it(`Should return countries config with no authorities`, () => {
    const countriesWithAuthorities = mock<CountryWithAuthoritiesDto[]>([{
      group: '',
      iso2: 'CG',
      name: 'Congo',
      authorities: null,
    }]);
    const countriesConfig = mock<CountryWithAuthorities[]>([{
      countryGroup: '',
      countryData: {
        countryCode: 'CG',
        countryName: 'Congo',
        authorities: [],
      },
    }]);

    const result = CountriesFactory.createCountriesConfig(countriesWithAuthorities);
    expect(result).toStrictEqual(countriesConfig);
  });

  it(`Should return countries config with a single authority`, () => {
    const countriesWithAuthorities = mock<CountryWithAuthoritiesDto[]>([
      {
        group: 'For Edge',
        iso2: 'BY',
        name: 'Belarus',
        authorities: 'GM',
      },
      {
        group: '',
        iso2: 'BG',
        name: 'Bulgaria',
        authorities: 'CY',
      },
    ]);
    const countriesConfig = mock<CountryWithAuthorities[]>([
      {
        countryGroup: 'For Edge',
        countryData: {
          countryCode: 'BY',
          countryName: 'Belarus',
          authorities: ['GM'],
        },
      },
      {
        countryGroup: '',
        countryData: {
          countryCode: 'BG',
          countryName: 'Bulgaria',
          authorities: ['CY'],
        },
      },
    ]);

    const result = CountriesFactory.createCountriesConfig(countriesWithAuthorities);
    expect(result).toStrictEqual(countriesConfig);
  });

  it(`Should return countries config with multiple authorities`, () => {
    const countriesWithAuthorities = mock<CountryWithAuthoritiesDto[]>([{
      group: 'For Edge',
      iso2: 'CX',
      name: 'Christmas Island',
      authorities: 'CY,GM',
    }]);
    const countriesConfig = mock<CountryWithAuthorities[]>([{
      countryGroup: 'For Edge',
      countryData: {
        countryCode: 'CX',
        countryName: 'Christmas Island',
        authorities: ['CY', 'GM'],
      },
    }]);

    const result = CountriesFactory.createCountriesConfig(countriesWithAuthorities);
    expect(result).toStrictEqual(countriesConfig);
  });
});
