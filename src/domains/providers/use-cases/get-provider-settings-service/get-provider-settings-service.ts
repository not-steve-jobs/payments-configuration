import { ProviderMethodRepository, ProviderRepository } from '@infra';
import { Cache, UseCase } from '@core';
import { ProviderSettingsMapper } from '@domains/providers/mappers/provider-settings-mapper';

import { GetProviderSettingsServiceParams, ProviderSettingsResponse } from '../../types';

export interface GetProviderSettingsServiceOptions {
  providerMethodRepository: ProviderMethodRepository;
  providerRepository: ProviderRepository;
}

export class GetProviderSettingsService extends UseCase<GetProviderSettingsServiceParams, ProviderSettingsResponse> {
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly providerRepository: ProviderRepository;

  constructor(options: GetProviderSettingsServiceOptions) {
    super(options);
    this.providerMethodRepository = options.providerMethodRepository;
    this.providerRepository = options.providerRepository;
  }

  @Cache()
  public async execute(payload: GetProviderSettingsServiceParams): Promise<ProviderSettingsResponse> {
    const provider = await this.providerRepository.findOneOrThrow({ code: payload.providerCode });
    const providerMethods = await this.providerMethodRepository.findWithCountryAuthority(
      provider.id,
      {},
      ['countryIso2', 'authorityFullCode']
    );

    return ProviderSettingsMapper.createDto(provider, providerMethods);
  }
}
