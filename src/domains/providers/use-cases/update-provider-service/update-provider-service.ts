import { ProviderEntity } from '@core/contracts/infrastructure/entities';
import { ProviderBaseDto, ProviderDto } from '@core/contracts/dtos';
import { UseCase } from '@core';
import { ProviderRepository } from '@infra/repos';
import { UpdateProviderServiceParams } from '@domains/providers/types';
import { ProviderFactory } from '@domains/providers/factories';

export interface UpdateProviderServiceOptions {
  providerRepository: ProviderRepository;
}

export class UpdateProviderService extends UseCase<UpdateProviderServiceParams, ProviderBaseDto> {
  private readonly providerRepository: ProviderRepository;

  constructor(options: UpdateProviderServiceOptions) {
    super(options);
    this.providerRepository = options.providerRepository;
  }

  private async updateProvider(providerId: string, data: Partial<ProviderEntity>): Promise<ProviderDto> {
    const provider = await this.providerRepository.update(providerId, data);

    return ProviderFactory.createDto(provider);
  }

  public async execute({ providerCode, data }: UpdateProviderServiceParams): Promise<ProviderDto> {
    const provider = await this.providerRepository.findOneOrThrow({ code: providerCode });

    return this.updateProvider(provider.id, data);
  }
}
