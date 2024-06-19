import { CountryAuthorityRepository, CurrencyRepository, ProviderFieldRepository, ProviderRepository } from '@infra';
import { ProviderFields, UpsertProviderFieldsServiceParams } from '@domains/providers/types';
import { ProviderFieldMapper } from '@domains/providers/mappers';
import { ProviderEntity, UseCase } from '@core';

import { UpsertProviderFieldsValidator } from './validator';

export interface UpsertProviderFieldsOptions {
  countryAuthorityRepository: CountryAuthorityRepository;
  providerFieldRepository: ProviderFieldRepository;
  providerRepository: ProviderRepository;
  currencyRepository: CurrencyRepository;
}

export class UpsertProviderFieldsServiceV2 extends UseCase<UpsertProviderFieldsServiceParams, ProviderFields> {
  private readonly countryAuthorityRepository: CountryAuthorityRepository;
  private readonly providerFieldRepository: ProviderFieldRepository;
  private readonly providerRepository: ProviderRepository;
  private readonly currencyRepository: CurrencyRepository;

  constructor(options: UpsertProviderFieldsOptions) {
    super(options);
    this.countryAuthorityRepository = options.countryAuthorityRepository;
    this.providerFieldRepository = options.providerFieldRepository;
    this.providerRepository = options.providerRepository;
    this.currencyRepository = options.currencyRepository;
  }

  public async execute(payload: UpsertProviderFieldsServiceParams): Promise<ProviderFields> {
    const provider = await this.providerRepository.findOneOrThrow({ code: payload.providerCode });
    await this.validateAndFormat(payload, provider);

    const upsertPayload = ProviderFieldMapper.createEntities(provider.code, payload);
    await this.providerFieldRepository.upsert(provider.code, upsertPayload);

    const entities = await this.providerFieldRepository.findOrdered(provider.code);
    return ProviderFieldMapper.mapFieldsToDtos(entities);
  }

  private async validateAndFormat(payload: UpsertProviderFieldsServiceParams, provider: ProviderEntity): Promise<void> {
    const [providerCountriesAuthorities, currencies] = await Promise.all([
      this.countryAuthorityRepository.findRelatedToProvider(provider.id),
      this.currencyRepository.findAllIso3().then(entities => entities.map(c => c.iso3)),
    ]);

    UpsertProviderFieldsValidator.validateAndFormat(payload, { currencies, providerCountriesAuthorities });
  }
}
