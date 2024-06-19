import { UseCase } from '@core';
import { CountryAuthorityRepository, CurrencyRepository, MethodRepository } from '@infra';
import { ConfigUpsertProcessor } from '@domains/providers/services';
import {
  CountryAuthorityMethodUpsertDto,
  CountryAuthorityMethods,
  UpsertConfigServiceParams,
  UpsertConfigServiceResponse,
} from '@domains/providers/types/contracts';
import { ProviderFactory } from '@domains/providers/factories';

import { UpsertConfigValidator } from './validators';

export interface UpsertConfigServiceOptions {
  countryAuthorityRepository: CountryAuthorityRepository;
  configUpsertProcessor: ConfigUpsertProcessor;
  currencyRepository: CurrencyRepository;
  methodRepository: MethodRepository;
}

export class UpsertConfigService extends UseCase<UpsertConfigServiceParams, UpsertConfigServiceResponse> {
  private readonly countryAuthorityRepository: CountryAuthorityRepository;
  private readonly configUpsertProcessor: ConfigUpsertProcessor;
  private readonly methodRepository: MethodRepository;

  constructor(options: UpsertConfigServiceOptions) {
    super(options);
    this.countryAuthorityRepository = options.countryAuthorityRepository;
    this.configUpsertProcessor = options.configUpsertProcessor;
    this.methodRepository = options.methodRepository;
  }

  public async execute(payload: UpsertConfigServiceParams): Promise<UpsertConfigServiceResponse> {
    UpsertConfigValidator.validate(payload);

    const countryAuthorityMethods = await this.getCountryAuthorityMethods(payload.countryAuthorityMethods);
    const data = await this.configUpsertProcessor.upsert({
      provider: payload.provider,
      countryAuthorityMethods,
    });

    return {
      provider: ProviderFactory.createDto(data.provider),
      countryAuthorityMethods: data.countryAuthorityMethods,
    };
  }

  private async getCountryAuthorityMethods(cam: CountryAuthorityMethodUpsertDto[]): Promise<CountryAuthorityMethods[]> {
    const methodCodes = Array.from(new Set(cam.map(p => p.method)));
    const countryToAuthorityMap = cam.reduce((acc, next) =>
      acc.set(`${next.country}:${next.authority}`.toLowerCase(), next), new Map<string, { country: string; authority: string }>());

    const [countryAuthorities, methods] = await Promise.all([
      this.countryAuthorityRepository.findByCountriesAuthoritiesOrThrow([...countryToAuthorityMap.values()]),
      this.methodRepository.findByCodesOrThrow(methodCodes),
    ]);

    return cam.reduce((acc, next) => {
      const countryAuthority = countryAuthorities.find(ca =>
        ca.countryIso2.toLowerCase() === next.country.toLowerCase()
        && ca.authorityFullCode.toLowerCase() === next.authority.toLowerCase()
      );
      const method = methods.find(m => m.code.toLowerCase() === next.method.toLowerCase());

      if (countryAuthority && method) {
        acc.push({ countryAuthority, method });
      }

      return acc;
    }, [] as CountryAuthorityMethods[]);
  }
}
