import { FieldDto, ProviderType, TransactionConfigDto } from '@core';

import { TransactionConfigFactory } from './transaction-config-factory';

describe('TransactionConfigFactory', () => {
  const providerMethodConfigDto = mock<TransactionConfigDto>({
    methodCode: '',
    providerCode: '',
    providerName: '',
    isProviderMethodEnabled: false,
    providerType: ProviderType.DEFAULT,
    minAmount: 0,
    maxAmount: 10,
    isEnabled: true,
    isPaymentAccountRequired: true,
    order: 20,
    refundsOrder: 30,
    payoutsOrder: 40,
    period: 30,
    isPayoutAsRefund: false,
  });
  const fields = mock<FieldDto[]>([]);

  it('Should create deposit settings', () => {
    expect(TransactionConfigFactory.createDepositSetting(providerMethodConfigDto, fields)).toStrictEqual({
      min: 0,
      max: 10,
      enabled: true,
      fields: [],
    });
  });

  it('Should create refund settings', () => {
    expect(TransactionConfigFactory.createRefundSetting(providerMethodConfigDto)).toStrictEqual({
      order: 30,
      enabled: true,
      minRefundableAmountThreshold: 0,
      maxRefundablePeriodInDays: 30,
      isRequestDetailsRequired: false,
    });
  });

  it('Should create payout settings', () => {
    expect(TransactionConfigFactory.createPayoutSetting(providerMethodConfigDto, fields)).toStrictEqual({
      min: 0,
      max: 10,
      enabled: true,
      order: 40,
      paymentAccountRequired: true,
      fields,
    });
  });
});
