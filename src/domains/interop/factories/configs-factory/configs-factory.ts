import {
  BankAccountEntity,
  ConfigFieldWithOptionDto,
  CredentialDto,
  FieldDto, FieldEntityType,
  TransactionConfigDto,
  TransactionType,
} from '@core';
import { BankAccountDto, ConfigDto, KeyValueConfig, ProviderConfig } from '@domains/interop/types';
import { BankAccountsMapper, CredentialsMapper } from '@domains/interop/mappers';
import { CountryAuthorityBoundedEntityManager, GetBoundedEntitiesParams } from '@domains/interop/services';
import { groupBy } from '@utils';

import { FieldFactory } from './field-factory';
import { TransactionConfigFactory } from './transaction-config-factory';

export interface CreateConfigsParams {
  country: string;
  authority: string;
  credentials: CredentialDto[];
  bankAccounts: BankAccountEntity[];
  specificFields: ConfigFieldWithOptionDto[];
  commonFields: ConfigFieldWithOptionDto[];
}

export class ConfigsFactory {
  private static getTransactionSettings(config: TransactionConfigDto, fields: FieldDto[]): Pick<
    ProviderConfig,
    'payoutSettings' | 'depositSettings' | 'refundSettings'
  > {
    if (config.type === TransactionType.PAYOUT) {
      return { payoutSettings: TransactionConfigFactory.createPayoutSetting(config, fields) };
    } else if (config.type === TransactionType.REFUND) {
      return { refundSettings: TransactionConfigFactory.createRefundSetting(config)  };
    } else if (config.type === TransactionType.DEPOSIT) {
      return { depositSettings: TransactionConfigFactory.createDepositSetting(config, fields) };
    } else {
      throw new Error('unknown config type');
    }
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
    config: TransactionConfigDto,
    specificFields: ConfigFieldWithOptionDto[],
    commonFields: ConfigFieldWithOptionDto[]
  ): FieldDto[] {
    const fieldsToMap = specificFields.filter(field =>
      field.entityType === FieldEntityType.PROVIDER_METHOD &&
      field.entityId === config.providerMethodId &&
      field.transactionType === config.type);

    const commonFieldsToMap = commonFields.filter(field =>
      field.entityType === FieldEntityType.PROVIDER &&
      field.entityId === config.providerId &&
      field.transactionType === config.type);

    return FieldFactory.createSettingFields(fieldsToMap, commonFieldsToMap, config.currencyIso3);
  }

  public static createConfigs(configs: TransactionConfigDto[], params: CreateConfigsParams): ConfigDto[] {
    const currencyToProviders = new Map<string, ProviderConfig[]>();
    const providerCodeToCredentials = groupBy(params.credentials, ({ providerCode }) => providerCode);
    const providerCodeToBankAccounts = groupBy(params.bankAccounts, ({ providerCode }) => providerCode);

    for (const config of configs) {
      const providers = currencyToProviders.get(config.currencyIso3) || [];
      const fields = this.getFields(config, params.specificFields, params.commonFields);

      let provider = providers.find(p => p.key === config.providerCode);
      if (!provider) {
        const boundedParams: GetBoundedEntitiesParams = {
          providerCode: config.providerCode,
          authorityFullCode: params.authority,
          countryIso2: params.country,
          currencyIso3: config.currencyIso3,
        };

        provider = TransactionConfigFactory.createConfig(
          config,
          this.getCredentials(providerCodeToCredentials.get(config.providerCode) ?? [], boundedParams),
          this.getAccounts(providerCodeToBankAccounts.get(config.providerCode) ?? [], boundedParams)
        );
        providers.push(provider);
      }

      Object.assign(provider, this.getTransactionSettings(config, fields));

      currencyToProviders.set(config.currencyIso3, providers);
    }

    return Array
      .from(currencyToProviders.entries())
      .map(([currency, providers]) => ({ currency, providers }));
  }
}
