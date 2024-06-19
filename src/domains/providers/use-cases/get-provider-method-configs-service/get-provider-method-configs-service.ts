import { UseCase } from '@core';
import { TransactionConfigRepository } from '@infra';
import { ProviderConfig } from '@domains/providers/types/contracts';
import { ProviderConfigsFactory } from '@domains/providers/factories';

import { GetProviderMethodConfigsServiceParams } from './types';

export interface GetProviderMethodConfigsServiceOptions {
  transactionConfigRepository: TransactionConfigRepository;
}

export class GetProviderMethodConfigsService extends UseCase<
  GetProviderMethodConfigsServiceParams,
  ProviderConfig[]
> {
  private readonly transactionConfigRepository: TransactionConfigRepository;
  constructor(options: GetProviderMethodConfigsServiceOptions) {
    super(options);
    this.transactionConfigRepository = options.transactionConfigRepository;
  }

  public async execute(payload: GetProviderMethodConfigsServiceParams): Promise<ProviderConfig[]> {
    const pmTransactionConfigs = await this.transactionConfigRepository.getProviderTransactionConfigs({
      methodCode: payload.methodCode,
      authority: payload.authority,
      country: payload.country,
      includeEmptyConfigs: true,
    });

    return ProviderConfigsFactory.createProviderConfigs(pmTransactionConfigs);
  }
}
