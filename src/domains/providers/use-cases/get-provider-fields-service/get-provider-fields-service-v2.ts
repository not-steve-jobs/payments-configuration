import { Cache, UseCase } from '@core';
import { ProviderFieldRepository, ProviderRepository } from '@infra';
import { GetProviderFieldsServiceParams } from '@domains/providers/types/contracts';
import { ProviderFieldMapper } from '@domains/providers/mappers';
import { ProviderFields } from '@domains/providers/types/dtos';

export interface GetProviderFieldsOptions {
  providerRepository: ProviderRepository;
  providerFieldRepository: ProviderFieldRepository;
}

export class GetProviderFieldsServiceV2 extends UseCase<GetProviderFieldsServiceParams, ProviderFields> {
  private readonly providerRepository: ProviderRepository;
  private readonly providerFieldRepository: ProviderFieldRepository;

  constructor(params: GetProviderFieldsOptions) {
    super(params);
    this.providerRepository = params.providerRepository;
    this.providerFieldRepository = params.providerFieldRepository;
  }

  @Cache()
  public async execute(payload: GetProviderFieldsServiceParams): Promise<ProviderFields> {
    const provider = await  this.providerRepository.findOne({ code: payload.providerCode });
    if (!provider) {
      return { common: [], specific: [] };
    }

    const fields = await this.providerFieldRepository.findOrdered(provider.code);

    return ProviderFieldMapper.mapFieldsToDtos(fields);
  }
}
