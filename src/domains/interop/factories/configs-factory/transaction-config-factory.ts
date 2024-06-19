import { FieldDto, TransactionConfigDto } from '@core';
import {
  BankAccountDto,
  DepositSetting,
  KeyValueConfig,
  PayoutSetting,
  ProviderConfig,
  RefundSetting,
} from '@domains/interop';

export class TransactionConfigFactory {
  public static createConfig(
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

  public static createDepositSetting(transactionConfigDto: TransactionConfigDto, fields: FieldDto[]): DepositSetting {
    return {
      min: transactionConfigDto.minAmount ?? 0,
      max: transactionConfigDto.maxAmount ?? null,
      enabled: transactionConfigDto.isEnabled,
      fields,
    };
  }

  public static createPayoutSetting(transactionConfigDto: TransactionConfigDto, fields: FieldDto[]): PayoutSetting {
    return {
      min: transactionConfigDto.minAmount ?? 0,
      max: transactionConfigDto.maxAmount ?? null,
      enabled: transactionConfigDto.isEnabled,
      order: transactionConfigDto.payoutsOrder || 0,
      paymentAccountRequired: transactionConfigDto.isPaymentAccountRequired,
      fields,
    };
  }

  public static createRefundSetting(transactionConfigDto: TransactionConfigDto): RefundSetting {
    return {
      order: transactionConfigDto.refundsOrder || 0,
      enabled: transactionConfigDto.isEnabled,
      minRefundableAmountThreshold: transactionConfigDto.minAmount ?? 0,
      maxRefundablePeriodInDays: transactionConfigDto.period ?? null,
      isRequestDetailsRequired: transactionConfigDto.isPayoutAsRefund,
    };
  }
}
