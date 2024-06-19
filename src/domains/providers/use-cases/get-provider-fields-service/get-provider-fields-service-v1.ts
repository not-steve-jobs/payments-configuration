import { Cache, FieldEntityType, UseCase } from '@core';
import { FieldRepository, ProviderRepository } from '@infra';
import { GetFieldsServiceResponse, GetProviderFieldsServiceParams } from '@domains/providers/types/contracts';

import { FieldWithOptionsFactory } from '../../factories';

export interface GetProviderFieldsServiceOptions {
  providerRepository: ProviderRepository;
  fieldRepository: FieldRepository;
}

export class GetProviderFieldsServiceV1 extends UseCase<GetProviderFieldsServiceParams, GetFieldsServiceResponse> {
  private readonly providerRepository: ProviderRepository;
  private readonly fieldRepository: FieldRepository;

  constructor(params: GetProviderFieldsServiceOptions) {
    super(params);
    this.providerRepository = params.providerRepository;
    this.fieldRepository = params.fieldRepository;
  }

  @Cache()
  public async execute(payload: GetProviderFieldsServiceParams): Promise<GetFieldsServiceResponse> {
    const provider = await  this.providerRepository.findOne({ code: payload.providerCode });

    if (!provider) {
      return { common: [], specific: [] };
    }

    const [commonFieldsWithOptions, specificFieldsWithOptions] = await Promise.all([
      this.fieldRepository.findFieldsWithOptions({ entityIds: [provider.id], entityType: FieldEntityType.PROVIDER } ),
      this.fieldRepository.getOrderedSpecificFieldsWithOptions(payload.providerCode),
    ]);

    const common = FieldWithOptionsFactory.createCommon(commonFieldsWithOptions);
    const specific = FieldWithOptionsFactory.createSpecific(specificFieldsWithOptions);

    return { common, specific };
  }
}
