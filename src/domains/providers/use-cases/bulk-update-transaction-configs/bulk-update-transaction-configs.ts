import {
  CurrencyRepository,
  ProviderMethodRepository,
  ProviderRepository,
  TransactionConfigRepository,
} from '@infra/repos';
import { NotFoundError, ValidationError } from '@internal/errors-library';
import { buildKey, equalsIgnoringCase } from '@utils';
import { TransactionConfigEntity } from '@core/contracts/infrastructure/entities';
import { ProviderMethodDetails } from '@core/contracts/dtos';
import { UseCase } from '@core';

import { TransactionEntityManager } from '../../services';

import { BulkUpdateTransactionConfigsParams, CountryAuthorityMethodDto } from './types';
import { Validator } from './validator';

export interface BulkUpdateTransactionConfigsOptions {
  transactionConfigRepository: TransactionConfigRepository;
  providerMethodRepository: ProviderMethodRepository;
  providerRepository: ProviderRepository;
  currencyRepository: CurrencyRepository;
}

interface BuildConfigsToUpdateParams extends BulkUpdateTransactionConfigsParams {
  providerMethodToConfigMap: Map<string, TransactionConfigEntity>;
  camToProviderMethodIdMap: Map<string, string>;
}

export class BulkUpdateTransactionConfigs extends UseCase<BulkUpdateTransactionConfigsParams, unknown> {
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly providerRepository: ProviderRepository;
  private readonly transactionConfigRepository: TransactionConfigRepository;
  private readonly currencyRepository: CurrencyRepository;

  constructor(options: BulkUpdateTransactionConfigsOptions) {
    super(options);
    this.transactionConfigRepository = options.transactionConfigRepository;
    this.providerMethodRepository = options.providerMethodRepository;
    this.providerRepository = options.providerRepository;
    this.currencyRepository = options.currencyRepository;
  }

  public async execute(params: BulkUpdateTransactionConfigsParams): Promise<void> {
    const { providerCode, countryAuthorityMethods, currencyConfigs } = params;

    const [provider, currencies] = await Promise.all([
      this.providerRepository.findOneOrThrow({ code: providerCode }),
      this.currencyRepository.findAllIso3(),
    ]);

    Validator.validateCurrencies({ currencyConfigs: currencyConfigs, currencies });
    const providerMethods = await this.providerMethodRepository.findByCountryAuthorityMethods(provider.id, { countryAuthorityMethods });
    if (providerMethods.length !== countryAuthorityMethods.length) {
      this.findAndThrowUnknownCAM(providerMethods, countryAuthorityMethods);
    }

    const camToProviderMethodIdMap = this.buildCAMToProviderMethodIdMap(providerMethods);
    const providerMethodToConfigMap = await this.buildProviderMethodToConfigMap(providerMethods);

    const configsToUpdate = this.buildConfigsToUpdate({ ...params, camToProviderMethodIdMap, providerMethodToConfigMap });
    if (configsToUpdate.length) {
      await this.transactionConfigRepository.bulkUpdate(configsToUpdate);
    }
  }

  private buildConfigsToUpdate(params: BuildConfigsToUpdateParams): TransactionConfigEntity[] {
    const configsToReturn: TransactionConfigEntity[] = [];

    for (const { country, authority, method } of params.countryAuthorityMethods) {
      const key = buildKey(country, authority, method);

      const providerMethodId = params.camToProviderMethodIdMap.get(key);
      if (!providerMethodId) {
        throw new NotFoundError(`There is no such country authority for provider method`, { id: { country, authority, method } });
      }

      configsToReturn.push(...this.buildConfigsToUpdateModels(providerMethodId, params));
    }

    return configsToReturn;
  }

  private buildConfigsToUpdateModels(providerMethodId: string, params: BuildConfigsToUpdateParams): TransactionConfigEntity[] {
    const configsToReturn: TransactionConfigEntity[] = [];

    for (const cc of params.currencyConfigs) {
      const { currency, ...configsToUpdate } = cc;

      Object.entries(configsToUpdate).forEach(([type, setting]) => {
        let config = params.providerMethodToConfigMap.get(buildKey(providerMethodId, type, currency));

        if (config) {
          config = TransactionEntityManager.updateConfig(config, setting);
        } else {
          config = TransactionEntityManager.createByType(type, { providerMethodId, currency, setting });
        }

        configsToReturn.push(config);
      });
    }

    return configsToReturn;
  }

  private async buildProviderMethodToConfigMap(providerMethods: ProviderMethodDetails[]): Promise<Map<string, TransactionConfigEntity>> {
    const providerMethodIds = Array.from(new Set<string>(providerMethods.map(pm => pm.id)));

    const configs = await this.transactionConfigRepository.findAll({ params: { providerMethodId: providerMethodIds } });

    return new Map<string, TransactionConfigEntity>(configs.map(next => {
      const key = buildKey(next.providerMethodId, next.type, next.currencyIso3);
      return [key, next];
    }));
  }

  private buildCAMToProviderMethodIdMap(providerMethods: ProviderMethodDetails[]): Map<string, string> {
    return providerMethods.reduce((map, providerMethod) => {
      const key = buildKey(providerMethod.countryIso2, providerMethod.authorityFullCode, providerMethod.methodCode);
      map.set(key, providerMethod.id);
      return map;
    }, new Map<string, string>);
  }

  private findAndThrowUnknownCAM(providerMethods: ProviderMethodDetails[], countryAuthorityMethods: CountryAuthorityMethodDto[]): void | never {
    const cam = countryAuthorityMethods.find(({ method, country, authority }) =>
      !providerMethods.find(pm =>
        equalsIgnoringCase(pm.methodCode, method)
        && equalsIgnoringCase(pm.authorityFullCode, authority)
        && equalsIgnoringCase(pm.countryIso2, country)
      ));

    if (cam) {
      throw new ValidationError(`For country ${cam.country}, authority ${cam.authority}, method ${cam.method} is not mapped`);
    }
  }
}
