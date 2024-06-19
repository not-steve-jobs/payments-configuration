import {
  DEFAULT_FIELD_PATTERN,
  DepositField,
  Option,
  ProviderFieldsEntity,
  ProviderType,
  TransactionConfigDto,
} from '@core';
import { DepositConfig, DepositConfigField, DepositConfigFieldOption, DepositCurrencySetting } from '@domains/interop';
import { getDefaultCurrency } from '@domains/interop/utils';

export class DepositConfigsMapper {
  public static createDepositConfigs(payload: {
    depositTransactionConfigs: TransactionConfigDto[];
    depositFields: ProviderFieldsEntity[];
    commonFields: ProviderFieldsEntity[];
  }): DepositConfig[] {
    const depositConfigsMap = new Map<string, DepositConfig>();
    const depositFieldsMap = this.createDepositFieldMap(payload.depositFields);
    const commonFieldsMap = this.createDepositFieldMap(payload.commonFields);

    for (const config of payload.depositTransactionConfigs) {
      const depositConfig = this.getOrCreateDepositConfig(depositConfigsMap, config);
      const currencySetting = this.createCurrencySetting(config);

      if (currencySetting) {
        depositConfig.currencySettings.push(currencySetting);
      }

      const fields = depositFieldsMap.get(config.providerCode) || [];
      const commonFields = commonFieldsMap.get(config.providerCode) || [];

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

  private static createDepositFieldMap(providerFields: ProviderFieldsEntity[]): Map<string, DepositConfigField[]> {
    const providerCodeFieldsMap = new Map<string, DepositConfigField[]>();
    providerFields.map(pf => {
      const parsedFields: DepositField[]  = JSON.parse(pf.fields);
      providerCodeFieldsMap.set(pf.providerCode, this.createInteropFieldModels(parsedFields));
    });

    return providerCodeFieldsMap;
  }

  private static createInteropFieldModels(fields: DepositField[]): DepositConfigField[] {
    const configFields: DepositConfigField[] = [];

    fields.forEach(f => {
      if (f.isEnabled) {
        configFields.push({
          key: f.key,
          value: f.defaultValue ?? '',
          type: f.valueType,
          required: Boolean(f.isMandatory),
          pattern: f.pattern || DEFAULT_FIELD_PATTERN,
          options: this.createInteropFieldOptionsModels(f.options),
        });
      }
    });

    return configFields;
  }

  private static createInteropFieldOptionsModels(options?: Option[]): DepositConfigFieldOption[] {
    if (!options) {
      return [];
    }

    const optionsToReturn: DepositConfigFieldOption[] = [];

    for (const option of options) {
      if (option.isEnabled) {
        optionsToReturn.push({ key: option.key, value: option.value });
      }
    }

    return optionsToReturn;
  }
}
