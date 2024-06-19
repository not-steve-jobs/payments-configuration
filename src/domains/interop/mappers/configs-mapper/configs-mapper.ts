import {
  BankAccountEntity,
  CredentialDto,
  FieldDto,
  ProviderFieldsEntity,
  TransactionConfigDto,
  TransactionType,
} from '@core';
import { CountryAuthorityBoundedEntityManager, GetBoundedEntitiesParams } from '@domains/interop/services';
import { BankAccountDto, ConfigDto, KeyValueConfig, ProviderConfig } from '@domains/interop/types';
import { buildKey, groupBy } from '@utils';

import { BankAccountsMapper } from '../bank-accounts-mapper';
import { CredentialsMapper } from '../credentials-mapper';

import { ConfigFieldsMapper } from './config-fields-mapper';
import { TransactionConfigsMapper } from './transaction-configs-mapper';

export interface MapToConfigsParams {
  country: string;
  authority: string;
  credentials: CredentialDto[];
  bankAccounts: BankAccountEntity[];
  providersFields: ProviderFieldsEntity[];
}

export class ConfigsMapper {
  private static buildNewConfig(
    transactionConfigDto: TransactionConfigDto,
    credentials: KeyValueConfig[],
    accounts: BankAccountDto[]
  ): ProviderConfig {
    return {
      key: transactionConfigDto.providerCode,
      name: transactionConfigDto.providerName,
      payoutSettings: { fields: [] },
      depositSettings: { fields: [], enabled: false },
      config: credentials,
      accounts,

      // Stubs
      stpSettings: {},
      stpAllowed: false,
      maintenance: false,
      stpMinDepositsCount: 0,
      stpMaxDepositAmount: 0,
      defaultLeverage: 0,
      transactionRejectApplicable: false,
      settings: [],
      fields: [],
      withdrawalFields: [],
    };
  }

  private static getCredentials(credentials: CredentialDto[], params: GetBoundedEntitiesParams): KeyValueConfig[] {
    const boundedCredentials = CountryAuthorityBoundedEntityManager.getBoundedEntities(credentials, params);

    return CredentialsMapper.mapToCredentialsDto(boundedCredentials, params.currencyIso3);
  }

  private static getAccounts(accounts: BankAccountEntity[], params: GetBoundedEntitiesParams): BankAccountDto[] {
    const boundedAccounts = CountryAuthorityBoundedEntityManager.getBoundedEntities(accounts, params);

    return BankAccountsMapper.mapToBankAccountsDto(boundedAccounts);
  }

  private static getFields(
    providerFields: ProviderFieldsEntity[],
    params: GetBoundedEntitiesParams
  ): FieldDto[] {
    const fieldsBoundedToCA = CountryAuthorityBoundedEntityManager.getBoundedEntities(providerFields, {
      providerCode: params.providerCode,
      countryIso2: params.countryIso2,
      authorityFullCode: params.authorityFullCode,
      currencyIso3: params.currencyIso3,
    });

    return ConfigFieldsMapper.mapToFieldsDto(fieldsBoundedToCA, params.currencyIso3);
  }

  private static assignSettingsByType(provider: ProviderConfig, config: TransactionConfigDto, fields: FieldDto[]): void {
    if (config.type === TransactionType.PAYOUT) {
      provider.payoutSettings = TransactionConfigsMapper.mapToPayoutSetting(config, fields);
    } else if (config.type === TransactionType.REFUND) {
      provider.refundSettings = TransactionConfigsMapper.mapToRefundSetting(config);
    } else if (config.type === TransactionType.DEPOSIT) {
      provider.depositSettings = TransactionConfigsMapper.mapToDepositSetting(config, fields);
    }
  }

  public static mapToConfigsDto(configs: TransactionConfigDto[], params: MapToConfigsParams): ConfigDto[] {
    const currencyToProviders = new Map<string, ProviderConfig[]>();
    const providerCodeToCredentials = groupBy(params.credentials, ({ providerCode }) => providerCode);
    const providerCodeToBankAccounts = groupBy(params.bankAccounts, ({ providerCode }) => providerCode);
    const providerCodeToFields = groupBy(params.providersFields, ({ providerCode, transactionType }) => buildKey(providerCode, transactionType));

    for (const config of configs) {
      const key = buildKey(config.providerCode, config.type);
      const providers = currencyToProviders.get(config.currencyIso3) || [];
      const boundedParams: GetBoundedEntitiesParams = {
        providerCode: config.providerCode,
        authorityFullCode: params.authority,
        countryIso2: params.country,
        currencyIso3: config.currencyIso3,
      };

      const fields = this.getFields(providerCodeToFields.get(key) || [], boundedParams);
      let provider = providers.find(p => p.key === config.providerCode);
      if (!provider) {
        const credentials = this.getCredentials(providerCodeToCredentials.get(config.providerCode) ?? [], boundedParams);
        const bankAccounts = this.getAccounts(providerCodeToBankAccounts.get(config.providerCode) ?? [], boundedParams);

        provider = this.buildNewConfig(config, credentials, bankAccounts);
        providers.push(provider);
      }

      this.assignSettingsByType(provider, config, fields);

      currencyToProviders.set(config.currencyIso3, providers);
    }

    return Array
      .from(currencyToProviders.entries())
      .map(([currency, providers]) => ({ currency, providers }));
  }
}
