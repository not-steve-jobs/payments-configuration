import casual from 'casual';

import { ConfigFieldWithOptionDto, ProviderType, TransactionConfigDto, TransactionType } from '@core';
import { DepositConfig, DepositCurrencySetting } from '@domains/interop';

import { DepositConfigsFactory } from './deposit-configs-factory';

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
  isPaymentAccountRequired: true,
  currencyIso3: 'EUR',
  type: TransactionType.DEPOSIT,
  order: 200,
  refundsOrder: 0,
  payoutsOrder: 0,
  minAmount: 10_000,
  maxAmount: 100_000,
  period: null,
  isEnabled: true,
  convertedCurrency: null,
  defaultCurrency: null,
  ...options,
});

const generateDepositConfig = (options?: Partial<DepositConfig>): DepositConfig => ({
  key: 'localCardTransfer',
  description: 'Local card transfer',
  provider: 'payport',
  type: ProviderType.DEFAULT,
  convertedCurrency: null,
  defaultCurrency: null,
  currencySettings: [],
  fields: [],
  ...options,
});

const generateDepositCurrencySetting = (options?: Partial<DepositCurrencySetting>): DepositCurrencySetting => ({
  currency: 'EUR',
  min: 10_000,
  max: 100_000,
  ...options,
});

describe('DepositConfigsFactory', () => {
  it('Should create empty deposit configs', () => {
    const depositTransactionConfigs: TransactionConfigDto[] = [];
    const depositFieldOptions: ConfigFieldWithOptionDto[] = [];
    const result = DepositConfigsFactory.createDepositConfigs({
      depositTransactionConfigs,
      depositFieldOptions,
      commonFieldOptions: [],
    });

    expect(result).toHaveLength(0);
  });

  it('Should create single deposit config with one currency', () => {
    const depositTransactionConfigs: TransactionConfigDto[] = [
      generateTransactionConfigDto(),
    ];
    const depositFieldOptions: ConfigFieldWithOptionDto[] = [];
    const expectedResult = [
      generateDepositConfig({
        currencySettings: [generateDepositCurrencySetting()],
      }),
    ];

    const result = DepositConfigsFactory.createDepositConfigs({
      depositTransactionConfigs,
      depositFieldOptions,
      commonFieldOptions: [],
    });


    expect(result).toHaveLength(1);
    expect(result).toStrictEqual(expectedResult);
  });

  it('Should create single deposit config with multiple currencies', () => {
    const eurTransactionConfig = generateTransactionConfigDto();
    const usdTransactionConfig = generateTransactionConfigDto({
      currencyIso3: 'USD',
      minAmount: 20_000,
      maxAmount: 200_000,
    });
    const depositTransactionConfigs: TransactionConfigDto[] = [eurTransactionConfig, usdTransactionConfig];
    const eurCurrencySetting = generateDepositCurrencySetting();
    const usdCurrencySetting = generateDepositCurrencySetting({
      currency: 'USD',
      min: 20_000,
      max: 200_000,
    });
    const depositFieldOptions: ConfigFieldWithOptionDto[] = [];
    const expectedResult = [
      generateDepositConfig({
        currencySettings: [eurCurrencySetting, usdCurrencySetting],
      }),
    ];

    const result = DepositConfigsFactory.createDepositConfigs({
      depositTransactionConfigs,
      depositFieldOptions,
      commonFieldOptions: [],
    });


    expect(result).toHaveLength(1);
    expect(result).toStrictEqual(expectedResult);
  });

  it('Should create multiple deposit configs with one currency', () => {
    const depositTransactionConfigs: TransactionConfigDto[] = [
      generateTransactionConfigDto(),
      generateTransactionConfigDto({ providerCode: 'payport2', providerName: 'Payport 2' }),
    ];
    const depositFieldOptions: ConfigFieldWithOptionDto[] = [];
    const expectedResult = [
      generateDepositConfig({
        currencySettings: [generateDepositCurrencySetting()],
      }),
      generateDepositConfig({
        provider: 'payport2',
        currencySettings: [generateDepositCurrencySetting()],
      }),
    ];

    const result = DepositConfigsFactory.createDepositConfigs({
      depositTransactionConfigs,
      depositFieldOptions,
      commonFieldOptions: [],
    });


    expect(result).toHaveLength(2);
    expect(result).toStrictEqual(expectedResult);
  });

  it('Should create deposit config with no currencies', () => {
    const depositTransactionConfigs: TransactionConfigDto[] = [generateTransactionConfigDto({ currencyIso3: undefined })];
    const depositFieldOptions: ConfigFieldWithOptionDto[] = [];
    const expectedResult = [
      generateDepositConfig(),
    ];

    const result = DepositConfigsFactory.createDepositConfigs({
      depositTransactionConfigs,
      depositFieldOptions,
      commonFieldOptions: [],
    });

    expect(result).toHaveLength(1);
    expect(result).toStrictEqual(expectedResult);
  });
});
