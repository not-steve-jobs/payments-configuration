import { UseCase } from '@core';
import { MethodRepository } from '@infra';
import { MethodMapper } from '@domains/countries-authorities-methods/mappers';
import { MethodDto } from '@domains/countries-authorities-methods/types';

export interface UpdateMethodOptions {
  methodRepository: MethodRepository;
}

export class UpdateMethod extends UseCase<MethodDto, MethodDto> {
  private readonly methodRepository: MethodRepository;

  constructor(options: UpdateMethodOptions) {
    super(options);
    this.methodRepository = options.methodRepository;
  }

  public async execute(payload: MethodDto): Promise<MethodDto> {
    const existingMethod = await this.methodRepository.findOne({ code: payload.code });
    const updateModel = MethodMapper.createEntityModel(payload);

    if (existingMethod) {
      return MethodMapper.createDto(await this.methodRepository.update(existingMethod.id, {
        ...updateModel,
        id: existingMethod.id,
      }));
    }

    return MethodMapper.createDto(await this.methodRepository.create(updateModel));
  }
}
