import { CountryEntity, UseCase } from '@core';
import { CountryDto } from '@core/contracts/dtos/country-dto';
import { CountryMapper } from '@domains/countries-authorities/mappers';
import { CountryRepository } from '@infra';
import { ValidationError } from '@internal/errors-library';

import { AddCountryValidator } from './validators';
import { AddCountryParams, CountriesLookupDto } from './types';

export interface AddCountryServiceOptions {
  countryRepository: CountryRepository;
}

export class AddCountryService extends UseCase<AddCountryParams, CountryDto> {
  private readonly countryRepository: CountryRepository;

  constructor(options: AddCountryServiceOptions) {
    super(options);
    this.countryRepository = options.countryRepository;
  }

  public async execute(data: AddCountryParams): Promise<CountryDto> {
    AddCountryValidator.validate(data);

    const countriesLookupDto = await this.getCountriesLookupDto(data.iso2);
    const country = countriesLookupDto.countryByIso2
      ? await this.updateCountry(countriesLookupDto.countryByIso2, data, countriesLookupDto)
      : await this.createNewCountry(data, countriesLookupDto);

    return CountryMapper.mapToDto(country);
  }

  private async createNewCountry(data: AddCountryParams, countriesLookupDto: CountriesLookupDto): Promise<CountryEntity> {
    this.checkAttributeUniqueness(countriesLookupDto.countriesIso3Map, 'iso3', data.iso3);
    this.checkAttributeUniqueness(countriesLookupDto.countriesNameMap, 'name', data.name);

    return await this.countryRepository.createCountry(data);
  }

  private async updateCountry(countryByIso2: CountryEntity, data: AddCountryParams, countriesLookupDto: CountriesLookupDto): Promise<CountryEntity> {
    if (countryByIso2.iso3 !== data.iso3) {
      this.checkAttributeUniqueness(countriesLookupDto.countriesIso3Map, 'iso3', data.iso3);
    }

    if (countryByIso2.name !== data.name) {
      this.checkAttributeUniqueness(countriesLookupDto.countriesNameMap, 'name', data.name);
    }

    return await this.countryRepository.updateCountry(data.iso2, data);
  }

  private checkAttributeUniqueness(map: Map<string, CountryEntity>, attribute: keyof CountryEntity, value: string): void | never {
    if (map.has(value.toUpperCase())) {
      throw new ValidationError(`country with ${attribute}: ${value} already exist`);
    }
  }

  private async getCountriesLookupDto(iso2: string): Promise<CountriesLookupDto> {
    const countries = await this.countryRepository.findAll({});

    const countryByIso2 = countries.find(c => c.iso2 === iso2);

    return countries.reduce((acc, country) => {
      acc.countriesIso3Map.set(country.iso3.toUpperCase(), country);
      acc.countriesNameMap.set(country.name.toUpperCase(), country);

      return acc;
    }, { countryByIso2, countriesIso3Map: new Map<string, CountryEntity>(), countriesNameMap: new Map<string, CountryEntity>() });
  }
}
