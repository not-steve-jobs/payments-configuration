import { UseCase } from '@core';
import { CountryAuthorityMethodRepository, CountryAuthorityRepository } from '@infra';
import { CountryAuthorityMethodFactory } from '@domains/countries-authorities-methods/factories';

import { GetCountryAuthorityMethodsServiceParams, GetCountryAuthorityMethodsServiceResponse } from './types';

export interface GetCountryAuthorityMethodsServiceOptions {
  countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
}

export class GetCountryAuthorityMethodsService extends UseCase<
  GetCountryAuthorityMethodsServiceParams,
  GetCountryAuthorityMethodsServiceResponse
> {
  private readonly countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  private readonly countryAuthorityRepository: CountryAuthorityRepository;

  constructor(options: GetCountryAuthorityMethodsServiceOptions) {
    super(options);
    this.countryAuthorityMethodRepository = options.countryAuthorityMethodRepository;
    this.countryAuthorityRepository = options.countryAuthorityRepository;
  }

  public async execute(payload: GetCountryAuthorityMethodsServiceParams): Promise<GetCountryAuthorityMethodsServiceResponse> {
    const { id: countryAuthorityId } = await this.countryAuthorityRepository.findOneOrThrow(payload.authority, payload.country);

    const entities = await this.countryAuthorityMethodRepository.findWithProvidersByCountryAuthority(countryAuthorityId);

    return {
      paymentMethodConfigs: entities.map(e => CountryAuthorityMethodFactory.createDtoWithProviders(e)),
    };
  }
}
