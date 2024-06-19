import { Cache, ProviderBaseDto, UseCase } from '@core';
import { ProviderRepository } from '@infra';

import { GetProvidersServiceParams } from '../../types';

interface GetProvidersServiceOptions {
  providerRepository: ProviderRepository;
}

export class GetProvidersService extends UseCase<GetProvidersServiceParams, ProviderBaseDto[]> {
  private readonly providerRepository: ProviderRepository;

  constructor(options: GetProvidersServiceOptions) {
    super(options);
    this.providerRepository = options.providerRepository;
  }

  @Cache()
  public execute(): Promise<ProviderBaseDto[]> {
    return this.providerRepository.findAllBaseProviders();
  }
}
