import { CountryWithAuthoritiesDto } from '@core/contracts/dtos/country-with-authorities-dto';
import { CountryWithAuthorities } from '@domains/countries-authorities-methods';

export class CountriesFactory {
  public static createCountriesConfig(countriesWithAuthorities: CountryWithAuthoritiesDto[]): CountryWithAuthorities[] {
    return countriesWithAuthorities.map(c => ({
      countryGroup: c.group ?? '',
      countryData: {
        countryCode: c.iso2,
        countryName: c.name,
        authorities: c.authorities ? c.authorities.split(',') : [],
      },
    }));
  }
}
