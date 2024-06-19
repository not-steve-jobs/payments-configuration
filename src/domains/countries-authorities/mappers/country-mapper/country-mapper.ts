import { CountryEntity } from '@core';
import { CountryDto } from '@core/contracts/dtos/country-dto';

export class CountryMapper {
  public static mapToDto(country: CountryEntity): CountryDto {
    return { group: country.group, iso2: country.iso2, iso3: country.iso3, name: country.name };
  }
}
