import casual from 'casual';

import { ProviderType, TransactionConfigDto, TransactionType } from '@core';
import { CurrencySetting, DepositSetting, PayoutSetting, ProviderConfig, RefundSetting } from '@domains/providers';

import { ProviderConfigsFactory } from './provider-configs-factory';

const DEFAULT_DEPOSIT_SETTING: DepositSetting = {
  minAmount: null,
  maxAmount: null,
  isEnabled: false,
};

const DEFAULT_PAYOUT_SETTING: PayoutSetting = {
  minAmount: null,
  maxAmount: null,
  isEnabled: false,
};

const DEFAULT_REFUND_SETTING: RefundSetting = {
  minAmount: null,
  period: null,
  isEnabled: false,
};

const generateTransactionConfigDto = (options?: Partial<TransactionConfigDto>): TransactionConfigDto => ({
  providerId: casual.uuid,
  providerMethodId: casual.uuid,
  methodCode: 'localCardTransfer',
  methodName: 'Local card transfer',
  providerCode: 'payport',
  providerName: 'Payport',
  providerType: ProviderType.DEFAULT,
  isProviderMethodEnabled: true,
  isPayoutAsRefund: false,
  isPaymentAccountRequired: false,
  order: 0,
  refundsOrder: 0,
  payoutsOrder: 0,
  currencyIso3: 'EUR',
  type: TransactionType.DEPOSIT,
  minAmount: 10_000,
  maxAmount: 100_000,
  period: 365,
  isEnabled: false,
  convertedCurrency: null,
  defaultCurrency: null,
  ...options,
});

const generateProviderConfig = (options?: Partial<ProviderConfig>): ProviderConfig => ({
  providerCode: 'payport',
  providerName: 'Payport',
  isEnabled: false,
  currencySettings: [],
  ...options,
});

const generateCurrencySetting = (options?: Partial<CurrencySetting>): CurrencySetting => ({
  currency: 'EUR',
  deposit: DEFAULT_DEPOSIT_SETTING,
  payout: DEFAULT_PAYOUT_SETTING,
  refund: DEFAULT_REFUND_SETTING,
  ...options,
});

describe('ProviderConfigsFactory', () => {
  it(`Should return empty provider configs`, () => {
    const transactionConfigs: TransactionConfigDto[] = [];

    const result = ProviderConfigsFactory.createProviderConfigs(transactionConfigs);
    expect(result).toHaveLength(0);
  });

  it(`Should return single provider config for one currency and single deposit setting`, () => {
    const transactionConfigs: TransactionConfigDto[] = [generateTransactionConfigDto( )];
    const deposit: DepositSetting = {
      minAmount: 10_000,
      maxAmount: 100_000,
      isEnabled: false,
    };
    const expectedResult: ProviderConfig[] = [
      generateProviderConfig({
        isEnabled: true,
        currencySettings: [ generateCurrencySetting({ deposit }) ],
      }),
    ];

    const result = ProviderConfigsFactory.createProviderConfigs(transactionConfigs);

    expect(result).toHaveLength(1);
    expect(result).toStrictEqual(expectedResult);
  });

  it(`Should return single provider config for multiple currencies and single deposit setting`, () => {
    const transactionConfigs: TransactionConfigDto[] = [
      generateTransactionConfigDto(),
      generateTransactionConfigDto({
        currencyIso3: 'USD',
        minAmount: 20_000,
        maxAmount: 200_000,
        isEnabled: true,
      }),
    ];

    const depositEUR: DepositSetting = {
      minAmount: 10_000,
      maxAmount: 100_000,
      isEnabled: false,
    };
    const depositUSD: DepositSetting = {
      minAmount: 20_000,
      maxAmount: 200_000,
      isEnabled: true,
    };
    const expectedResult: ProviderConfig[] = [
      generateProviderConfig({
        isEnabled: true,
        currencySettings: [
          generateCurrencySetting({ deposit: depositEUR }),
          generateCurrencySetting({ currency: 'USD', deposit: depositUSD }),
        ],
      }),
    ];

    const result = ProviderConfigsFactory.createProviderConfigs(transactionConfigs);

    expect(result).toHaveLength(1);
    expect(result).toStrictEqual(expectedResult);
  });

  it(`Should return single provider config for one currency and multiple setting types`, () => {
    const transactionConfigs: TransactionConfigDto[] = [
      generateTransactionConfigDto({ isEnabled: true }),
      generateTransactionConfigDto({ type: TransactionType.PAYOUT }),
      generateTransactionConfigDto({ type: TransactionType.REFUND, isEnabled: true }),
    ];

    const deposit: DepositSetting = {
      minAmount: 10_000,
      maxAmount: 100_000,
      isEnabled: true,
    };
    const payout: PayoutSetting = {
      minAmount: 10_000,
      maxAmount: 100_000,
      isEnabled: false,
    };
    const refund: RefundSetting = {
      minAmount: 10_000,
      period: 365,
      isEnabled: true,
    };
    const expectedResult: ProviderConfig[] = [
      generateProviderConfig({
        isEnabled: true,
        currencySettings: [ generateCurrencySetting({ deposit, payout, refund }) ],
      }),
    ];

    const result = ProviderConfigsFactory.createProviderConfigs(transactionConfigs);

    expect(result).toHaveLength(1);
    expect(result).toStrictEqual(expectedResult);
  });

  it(`Should return multiple provider configs for one currency and deposit setting`, () => {
    const transactionConfigs: TransactionConfigDto[] = [
      generateTransactionConfigDto({ isEnabled: true }),
      generateTransactionConfigDto({ providerCode: 'payport2', providerName: 'Payport 2', isEnabled: true }),
    ];

    const deposit: DepositSetting = {
      minAmount: 10_000,
      maxAmount: 100_000,
      isEnabled: true,
    };
    const expectedResult: ProviderConfig[] = [
      generateProviderConfig({
        isEnabled: true,
        currencySettings: [ generateCurrencySetting({ deposit }) ],
      }),
      generateProviderConfig({
        providerCode: 'payport2',
        providerName: 'Payport 2',
        isEnabled: true,
        currencySettings: [ generateCurrencySetting({ deposit }) ],
      }),
    ];

    const result = ProviderConfigsFactory.createProviderConfigs(transactionConfigs);

    expect(result).toHaveLength(2);
    expect(result).toStrictEqual(expectedResult);
  });
});
