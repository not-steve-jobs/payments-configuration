import { UseCase } from '@core';
import { CurrencyRepository, ProviderRepository } from '@infra';
import { ProviderFields, UpsertProviderFieldsServiceParams } from '@domains/providers/types';
import { FieldsService } from '@domains/providers/services';

import { UpsertProviderFieldsValidator } from './validators';

export interface UpsertProviderFieldsServiceOptions {
  providerRepository: ProviderRepository;
  currencyRepository: CurrencyRepository;
  fieldsService: FieldsService;
}

export class UpsertProviderFieldsServiceV1 extends UseCase<UpsertProviderFieldsServiceParams, ProviderFields> {
  private readonly providerRepository: ProviderRepository;
  private readonly currencyRepository: CurrencyRepository;
  private readonly fieldsService: FieldsService;

  constructor(options: UpsertProviderFieldsServiceOptions) {
    super(options);
    this.fieldsService = options.fieldsService;
    this.providerRepository = options.providerRepository;
    this.currencyRepository = options.currencyRepository;
  }

  private async getAllCurrencies(): Promise<string[]> {
    const currencies = await this.currencyRepository.findAllIso3();

    return currencies.map(c => c.iso3);
  }

  public async execute(payload: UpsertProviderFieldsServiceParams): Promise<ProviderFields> {
    UpsertProviderFieldsValidator.validate(payload, { currencies: await this.getAllCurrencies() });

    const { id: providerId } = await this.providerRepository.findOneOrThrow({ code: payload.providerCode });

    return this.fieldsService.upsert(providerId, payload.common, payload.specific);
  }
}
