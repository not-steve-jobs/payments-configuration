import { FieldDto, TransactionConfigDto } from '@core';
import { DepositSetting, PayoutSetting, RefundSetting } from '@domains/interop';

export class TransactionConfigsMapper {
  public static mapToDepositSetting(transactionConfigDto: TransactionConfigDto, fields: FieldDto[]): DepositSetting {
    return {
      min: transactionConfigDto.minAmount ?? 0,
      max: transactionConfigDto.maxAmount ?? null,
      enabled: transactionConfigDto.isEnabled,
      fields,
    };
  }

  public static mapToPayoutSetting(transactionConfigDto: TransactionConfigDto, fields: FieldDto[]): PayoutSetting {
    return {
      min: transactionConfigDto.minAmount ?? 0,
      max: transactionConfigDto.maxAmount ?? null,
      enabled: transactionConfigDto.isEnabled,
      order: transactionConfigDto.payoutsOrder || 0,
      paymentAccountRequired: transactionConfigDto.isPaymentAccountRequired,
      fields,
    };
  }

  public static mapToRefundSetting(transactionConfigDto: TransactionConfigDto): RefundSetting {
    return {
      order: transactionConfigDto.refundsOrder || 0,
      enabled: transactionConfigDto.isEnabled,
      minRefundableAmountThreshold: transactionConfigDto.minAmount ?? 0,
      maxRefundablePeriodInDays: transactionConfigDto.period ?? null,
      isRequestDetailsRequired: transactionConfigDto.isPayoutAsRefund,
    };
  }
}
