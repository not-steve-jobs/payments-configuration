import { ProviderMethodWithCountryAuthority, UseCase } from '@core';
import { CurrencyRepository, MethodRepository, ProviderMethodRepository, ProviderRepository } from '@infra';
import { ProviderSettingsMapper } from '@domains/providers/mappers';
import { ProviderSettingsResponse, UpdateProviderSettingsServiceParams } from '@domains/providers/types';

import { buildPayload } from './tools';
import { UpdateProviderSettingsValidator } from './validators';

export interface UpdateProviderSettingsServiceOptions {
  providerMethodRepository: ProviderMethodRepository;
  providerRepository: ProviderRepository;
  currencyRepository: CurrencyRepository;
  methodRepository: MethodRepository;
}

export class UpdateProviderSettingsService extends UseCase<UpdateProviderSettingsServiceParams, ProviderSettingsResponse> {
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly providerRepository: ProviderRepository;
  private readonly currencyRepository: CurrencyRepository;

  constructor(options: UpdateProviderSettingsServiceOptions) {
    super(options);
    this.providerMethodRepository = options.providerMethodRepository;
    this.providerRepository = options.providerRepository;
    this.currencyRepository = options.currencyRepository;
  }

  public async execute(params: UpdateProviderSettingsServiceParams): Promise<ProviderSettingsResponse> {
    const [provider] = await Promise.all([
      this.providerRepository.findOneOrThrow({ code: params.provider.code }),
      params.provider.convertedCurrency && this.currencyRepository.findOneOrThrow(params.provider.convertedCurrency),
    ]);

    const providerMethods = await this.providerMethodRepository.findWithCountryAuthority(provider.id);
    UpdateProviderSettingsValidator.validate({
      countryAuthoritySettings: params.countryAuthoritySettings,
      providerMethods,
      boundedCurrenciesToMethods: await this.providerMethodRepository.findBoundedCurrenciesToMethods(provider.id),
    });

    return this.updateSettings(provider.id, params, providerMethods);
  }

  private async updateSettings(
    providerId: string,
    params: UpdateProviderSettingsServiceParams,
    providerMethodsToUpdate: ProviderMethodWithCountryAuthority[]
  ): Promise<ProviderSettingsResponse> {
    const payload = buildPayload(params.countryAuthoritySettings, providerMethodsToUpdate);

    const [
      provider,
      providerMethods,
    ] = await this.providerMethodRepository.runInTransaction(tx => Promise.all([
      this.providerRepository.update(providerId, { type: params.provider.type, convertedCurrency: params.provider.convertedCurrency }, tx),
      this.providerMethodRepository.updateSettings(providerId, payload, tx),
    ]));

    return ProviderSettingsMapper.createDto(provider, providerMethods);
  }
}
