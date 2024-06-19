import { Cache, UseCase } from '@core';
import { ProviderRestrictionsRepository } from '@infra';
import { ProviderRestrictionsGroupDto } from '@domains/providers';
import { ProviderRestrictionsMapper } from '@domains/providers/mappers';

export interface GetProviderRestrictionsOptions {
  providerRestrictionsRepository: ProviderRestrictionsRepository;
}

export class GetProviderRestrictions extends UseCase<string, ProviderRestrictionsGroupDto[]> {
  private readonly providerRestrictionsRepository: ProviderRestrictionsRepository;

  constructor(options: GetProviderRestrictionsOptions) {
    super(options);
    this.providerRestrictionsRepository = options.providerRestrictionsRepository;
  }

  @Cache()
  public async execute(providerCode: string): Promise<ProviderRestrictionsGroupDto[]> {
    const providerRestrictions = await this.providerRestrictionsRepository.getProviderRestrictions(providerCode);
    return ProviderRestrictionsMapper.createGroup(providerRestrictions);
  }
}
