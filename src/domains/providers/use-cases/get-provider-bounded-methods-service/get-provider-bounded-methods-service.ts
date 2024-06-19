import { CountryAuthorityDto, UseCase } from '@core';
import {
  CountryAuthorityRepository,
  MethodRepository,
  ProviderMethodRepository,
} from '@infra';

import { ProviderMethodBoundedFactory } from '../../factories';
import { GetProviderBoundedMethodsServiceParams, ProviderMethodBoundedDto } from '../../types';

export interface GetProviderBoundedMethodsServiceOptions {
  providerMethodRepository: ProviderMethodRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
  methodRepository: MethodRepository;
}

export class GetProviderBoundedMethodsService extends UseCase<GetProviderBoundedMethodsServiceParams, ProviderMethodBoundedDto[]> {
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly countryAuthorityRepository: CountryAuthorityRepository;
  private readonly methodRepository: MethodRepository;

  constructor(options: GetProviderBoundedMethodsServiceOptions) {
    super(options);
    this.providerMethodRepository = options.providerMethodRepository;
    this.countryAuthorityRepository = options.countryAuthorityRepository;
    this.methodRepository = options.methodRepository;
  }

  private async getMethodCodeToBoundedCAMap(providerCode: string): Promise<Map<string, Map<string, CountryAuthorityDto>>> {
    const boundedMethods = await this.providerMethodRepository.findBoundedMethods(providerCode);

    return boundedMethods.reduce((acc, next) => {
      const boundedCA = acc.get(next.methodCode) ?? new Map<string, CountryAuthorityDto>;

      boundedCA.set(next.countryAuthorityId, {
        authority: next.authority,
        country: next.country,
      });

      acc.set(next.methodCode, boundedCA);

      return acc;
    }, new Map<string, Map<string, CountryAuthorityDto>>());
  }

  private async getCountryAuthorityIds(countryAuthorities: CountryAuthorityDto[] = []): Promise<string[]> {
    if (!countryAuthorities.length) {
      return [];
    }

    const countryAuthorityEntities = await this.countryAuthorityRepository.findByCountriesAuthoritiesOrThrow(countryAuthorities);

    return countryAuthorityEntities.map(({ id }) => id);
  }

  public async execute(params: GetProviderBoundedMethodsServiceParams): Promise<ProviderMethodBoundedDto[]> {
    const countryAuthorityIds = await this.getCountryAuthorityIds(params.countryAuthorities);

    const [methods, methodCodeToBoundedCAMap] = await Promise.all([
      this.methodRepository.findAll({}),
      this.getMethodCodeToBoundedCAMap(params.providerCode),
    ]);

    return ProviderMethodBoundedFactory.createDto({
      countryAuthorityIds,
      methodCodeToBoundedCAMap,
      methods,
    });
  }
}
