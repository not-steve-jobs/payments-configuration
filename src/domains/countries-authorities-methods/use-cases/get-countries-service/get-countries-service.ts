import { Cache, UseCase } from '@core';
import { CountryRepository } from '@infra';
import { CountriesFactory } from '@domains/countries-authorities-methods/factories';

import { GetCountriesServiceParams, GetCountriesServiceResponse } from './types';

export interface GetCountriesServiceOptions {
  countryRepository: CountryRepository;
}

export class GetCountriesService extends UseCase<GetCountriesServiceParams, GetCountriesServiceResponse> {
  private readonly countryRepository: CountryRepository;

  constructor(options: GetCountriesServiceOptions) {
    super(options);
    this.countryRepository = options.countryRepository;
  }

  @Cache()
  public async execute(payload: GetCountriesServiceParams): Promise<GetCountriesServiceResponse> {
    const countriesWithAuthorities = await this.countryRepository.getCountriesWithAuthorities({
      authorityFullCode: payload.authority,
      providerCode: payload.providerCode,
    });

    return { countries: CountriesFactory.createCountriesConfig(countriesWithAuthorities) };
  }
}
