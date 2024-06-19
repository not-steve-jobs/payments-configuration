import { Knex } from 'knex';

import {
  CountryAuthorityMethodRepository,
  CountryAuthorityRepository,
  ProviderMethodRepository,
  TransactionConfigRepository,
} from '@infra';
import { ProviderMethodDefaultCurrency, TransactionConfigEntity, TransactionType, UseCase } from '@core';
import {
  ProviderConfig,
  UpdateConfigsByTypeParams,
  UpdateProviderMethodConfig,
  UpdateProviderMethodConfigsServiceParams,
} from '@domains/providers';
import { ProviderConfigsFactory } from '@domains/providers/factories';
import { TransactionEntityManager } from '@domains/providers/services';
import { buildKey, groupBy, parseJSONSafe } from '@utils';

export interface ChangeProviderMethodTransactionsConfigsServiceOptions {
  countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
  providerMethodRepository: ProviderMethodRepository;
  transactionConfigRepository: TransactionConfigRepository;
}

export class UpdateProviderMethodConfigsService extends UseCase<UpdateProviderMethodConfigsServiceParams, ProviderConfig[]> {
  private readonly countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  private readonly countryAuthorityRepository: CountryAuthorityRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly transactionConfigRepository: TransactionConfigRepository;

  constructor(options: ChangeProviderMethodTransactionsConfigsServiceOptions) {
    super(options);
    this.countryAuthorityMethodRepository = options.countryAuthorityMethodRepository;
    this.countryAuthorityRepository = options.countryAuthorityRepository;
    this.providerMethodRepository = options.providerMethodRepository;
    this.transactionConfigRepository = options.transactionConfigRepository;
  }

  public async execute(payload: UpdateProviderMethodConfigsServiceParams): Promise<ProviderConfig[]> {
    const countryAuthority = await this.countryAuthorityRepository.findOneOrThrow(payload.authority, payload.country);
    const countryAuthorityMethod = await this.countryAuthorityMethodRepository.findOneOrThrow(countryAuthority.id, payload.methodCode);

    await this.providerMethodRepository.runInTransaction(async tx => {
      await Promise.all(payload.providerConfigs.map(pc =>
        this.updateSettings(countryAuthorityMethod.id, pc, tx))
      );
    });

    const configs = await this.transactionConfigRepository.getProviderTransactionConfigs({
      methodCode: payload.methodCode,
      authority: payload.authority,
      country: payload.country,
      includeEmptyConfigs: true,
    });
    return ProviderConfigsFactory.createProviderConfigs(configs);
  }

  private async updateSettings(
    countryAuthorityMethodId: string,
    providerConfig: UpdateProviderMethodConfig,
    tx: Knex.Transaction
  ): Promise<void> {
    const providerMethod = await this.providerMethodRepository.findByCountryAuthorityIdOrThrow(countryAuthorityMethodId, providerConfig.providerCode, tx);
    const configs = await this.transactionConfigRepository.findByProviderMethodId(providerMethod.id, tx);
    const keyToConfigsMap = groupBy(configs, c => buildKey(c.providerMethodId, c.currencyIso3, c.type));
    const configsNew: TransactionConfigEntity[] = [];

    for (const currencySetting of providerConfig.currencySettings) {
      const baseOptions = { currencySetting, providerMethodId: providerMethod.id };

      Object.values(TransactionType).forEach(transactionType => {
        if (currencySetting[transactionType]) {
          this.updateConfigsByType(keyToConfigsMap, baseOptions, transactionType, configsNew);
        }
      });
    }

    await Promise.all([
      // Update all new configurations sent in the request
      configsNew.length ? this.transactionConfigRepository.bulkUpdate(configsNew, tx) : Promise.resolve(),

      // Remove any configurations that were not included in the request
      this.transactionConfigRepository.removeAll({
        providerMethodIds: [providerMethod.id],
        exclude: {
          ids: configsNew.map(c => c.id),
        },
      }, tx),

      // Update the settings of the provider method
      this.providerMethodRepository.update(providerMethod.id, {
        isEnabled: providerConfig.isEnabled,
        // If the currency was deleted during TX we should reset defaultCurrency to NULL
        defaultCurrency: this.getDefaultCurrency(providerMethod.defaultCurrency, configsNew),
      }, tx),
    ]);
  }

  private getDefaultCurrency(defaultCurrency: string | null, configs: TransactionConfigEntity[]): string | null {
    const currencies = new Set<string>(configs.map(c => c.currencyIso3));
    const currencyDB = parseJSONSafe<ProviderMethodDefaultCurrency>(defaultCurrency as string);

    if (currencyDB && currencies.has(currencyDB.currency)) {
      return defaultCurrency;
    }

    return null;
  }

  private updateConfigsByType(
    keyToConfigsMap: Map<string, TransactionConfigEntity[]>,
    params: UpdateConfigsByTypeParams,
    transactionType: TransactionType,
    accumulator: TransactionConfigEntity[]
  ): void {
    const key = buildKey(params.providerMethodId, params.currencySetting.currency, transactionType);
    const configs = keyToConfigsMap.get(key);

    if (configs?.length) {
      const config = configs[0];
      const transactionConfig = params.currencySetting[transactionType];
      const configNew = TransactionEntityManager.updateConfig(config, { currencyIso3: params.currencySetting.currency, ...transactionConfig });

      accumulator.push(configNew);
    } else {
      TransactionEntityManager.createTransactionConfigEntities(params.providerMethodId, params.currencySetting).forEach(configNew => {
        accumulator.push(configNew);
      });
    }
  }
}
