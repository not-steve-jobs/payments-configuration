import { CountryEntity } from '@core';

export interface AddCountryParams {
  iso2: string;
  iso3: string;
  name: string;
  group: string;
}

export interface CountriesLookupDto {
  countryByIso2?: CountryEntity;
  countriesIso3Map: Map<string, CountryEntity>;
  countriesNameMap: Map<string, CountryEntity>;
}
