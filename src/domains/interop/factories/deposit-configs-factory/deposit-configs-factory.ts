import { ConfigFieldWithOptionDto, ProviderType, TransactionConfigDto } from '@core';
import { DepositConfig, DepositCurrencySetting } from '@domains/interop';
import { getDefaultCurrency } from '@domains/interop/utils';

import { DepositConfigFieldsFactory } from './deposit-config-fields-factory';

export class DepositConfigsFactory {
  public static createDepositConfigs(payload: {
    depositTransactionConfigs: TransactionConfigDto[];
    depositFieldOptions: ConfigFieldWithOptionDto[];
    commonFieldOptions: ConfigFieldWithOptionDto[];
  }): DepositConfig[] {
    const depositConfigsMap = new Map<string, DepositConfig>();
    const depositFieldsMap = DepositConfigFieldsFactory.createDepositFieldMap(payload.depositFieldOptions);
    const commonFieldsMap = DepositConfigFieldsFactory.createDepositFieldMap(payload.commonFieldOptions);

    for (const config of payload.depositTransactionConfigs) {
      const depositConfig = this.getOrCreateDepositConfig(depositConfigsMap, config);
      const currencySetting = this.createCurrencySetting(config);

      if (currencySetting) {
        depositConfig.currencySettings.push(currencySetting);
      }

      const fields = depositFieldsMap.get(config.providerMethodId) || [];
      const commonFields = commonFieldsMap.get(config.providerId) || [];

      for (const commonField of commonFields) {
        if (!fields.find(f => f.key === commonField.key)) {
          fields.push(commonField);
        }
      }

      depositConfig.fields = fields;
    }

    return [...depositConfigsMap.values()];
  }

  private static getOrCreateDepositConfig(depositConfigsMap: Map<string, DepositConfig>, depositConfig: TransactionConfigDto): DepositConfig {
    const mapKey = `${depositConfig.methodCode}-${depositConfig.providerCode}`;
    const existingConfig = depositConfigsMap.get(mapKey);
    if (existingConfig) {
      return existingConfig;
    }

    const createdConfig = this.createDepositConfig(depositConfig);
    depositConfigsMap.set(mapKey, createdConfig);

    return createdConfig;
  }

  private static createDepositConfig(depositConfig: TransactionConfigDto): DepositConfig {
    return {
      key: depositConfig.methodCode,
      description: depositConfig.methodName,
      provider: depositConfig.providerCode,
      currencySettings: [],
      convertedCurrency: depositConfig.convertedCurrency,
      defaultCurrency: getDefaultCurrency(depositConfig.defaultCurrency),
      type: depositConfig.providerType === ProviderType.CRYPTO ? ProviderType.CRYPTO : ProviderType.DEFAULT,
      fields: [],
    };
  }

  private static createCurrencySetting(depositConfig: TransactionConfigDto): DepositCurrencySetting | null {
    if (depositConfig.currencyIso3) {
      return {
        currency: depositConfig.currencyIso3,
        min: depositConfig.minAmount ?? undefined,
        max: depositConfig.maxAmount ?? null,
      };
    }

    return null;
  }
}
