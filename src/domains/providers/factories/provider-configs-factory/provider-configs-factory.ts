import { TransactionConfigDto, TransactionType } from '@core';
import { CurrencySetting, DepositSetting, PayoutSetting, ProviderConfig, RefundSetting } from '@domains/providers';

export class ProviderConfigsFactory {
  public static createProviderConfigs(transactionConfigs: TransactionConfigDto[]): ProviderConfig[] {
    const providerConfigsMap = new Map<string, ProviderConfig>();

    for (const transactionConfig of transactionConfigs) {
      const providerConfig = this.getProviderConfig(providerConfigsMap, transactionConfig);

      if (transactionConfig.currencyIso3 !== null) {
        const currencySetting = this.getCurrencySetting(providerConfig, transactionConfig.currencyIso3);

        this.updateCurrencySetting(transactionConfig, currencySetting);
      }
    }

    return [...providerConfigsMap.values()];
  };

  private static getProviderConfig(providerConfigsMap: Map<string, ProviderConfig>, transactionConfig: TransactionConfigDto): ProviderConfig {
    const existingProviderConfig = providerConfigsMap.get(transactionConfig.providerCode);
    if (existingProviderConfig) {
      return existingProviderConfig;
    }

    const providerConfig = this.createProviderConfig(transactionConfig);
    providerConfigsMap.set(providerConfig.providerCode, providerConfig);

    return providerConfig;
  }

  private static createProviderConfig(tc: TransactionConfigDto): ProviderConfig {
    return {
      providerCode: tc.providerCode,
      providerName: tc.providerName,
      isEnabled: tc.isProviderMethodEnabled,
      currencySettings: [],
    };
  }

  private static getCurrencySetting (providerConfig: ProviderConfig, currency: string): CurrencySetting {
    const existingCurrencySetting = providerConfig.currencySettings
      .find(cs => cs.currency === currency);
    if (existingCurrencySetting) {
      return existingCurrencySetting;
    }

    const currencySetting = this.createCurrencySetting(currency);
    providerConfig.currencySettings.push(currencySetting);

    return currencySetting;
  }

  private static createCurrencySetting(currency: string): CurrencySetting {
    return {
      currency,
      deposit: {
        minAmount: null,
        maxAmount: null,
        isEnabled: false,
      },
      payout: {
        minAmount: null,
        maxAmount: null,
        isEnabled: false,
      },
      refund: {
        minAmount: null,
        period: null,
        isEnabled: false,
      },
    };
  }

  private static updateCurrencySetting(transactionConfig: TransactionConfigDto, currencySetting: CurrencySetting): void {
    switch (transactionConfig.type) {
      case TransactionType.DEPOSIT:
        currencySetting.deposit = this.createDepositSetting(transactionConfig);
        break;
      case TransactionType.PAYOUT:
        currencySetting.payout = this.createPayoutSetting(transactionConfig);
        break;
      case TransactionType.REFUND:
        currencySetting.refund = this.createRefundSetting(transactionConfig);
        break;
    }
  }

  private static createDepositSetting(tc: TransactionConfigDto): DepositSetting {
    return {
      minAmount: tc.minAmount,
      maxAmount: tc.maxAmount,
      isEnabled: tc.isEnabled,
    };
  }

  private static createPayoutSetting(tc: TransactionConfigDto): PayoutSetting {
    return {
      minAmount: tc.minAmount,
      maxAmount: tc.maxAmount,
      isEnabled: tc.isEnabled,
    };
  }

  private static createRefundSetting(tc: TransactionConfigDto): RefundSetting {
    return {
      minAmount: tc.minAmount,
      period: tc.period,
      isEnabled: tc.isEnabled,
    };
  }
}
