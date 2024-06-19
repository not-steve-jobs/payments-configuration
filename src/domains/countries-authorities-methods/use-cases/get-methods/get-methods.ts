import { Cache, UseCase } from '@core';
import { MethodRepository } from '@infra';
import { MethodMapper } from '@domains/countries-authorities-methods/mappers';
import { GetMethodsResponse } from '@domains/countries-authorities-methods/types';

export interface GetMethodsOptions {
  methodRepository: MethodRepository;
}

export class GetMethods extends UseCase<void, GetMethodsResponse> {
  private readonly methodRepository: MethodRepository;

  constructor(options: GetMethodsOptions) {
    super(options);
    this.methodRepository = options.methodRepository;
  }

  @Cache()
  public async execute(): Promise<GetMethodsResponse> {
    const entities = await this.methodRepository.findAll({ order: ['code'] });

    return {
      methods: entities.map(e => MethodMapper.createDto(e)),
    };
  }
}
