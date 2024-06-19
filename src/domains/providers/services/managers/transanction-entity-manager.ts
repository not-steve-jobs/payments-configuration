import { randomUUID } from 'crypto';

import { ValidationError } from '@internal/errors-library';
import { TransactionConfigEntity, TransactionType } from '@core';
import { CurrencySetting, DepositSetting, PayoutSetting, RefundSetting } from '@domains/providers';

interface TransactionConfigByTypeOptions {
  providerMethodId: string;
  currency: string;
  setting: Partial<DepositSetting & PayoutSetting & RefundSetting>;
}

export class TransactionEntityManager {
  public static updateConfig({ ...entity }: TransactionConfigEntity, payload: Partial<TransactionConfigEntity>): TransactionConfigEntity {
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        entity[key as keyof TransactionConfigEntity] = value as keyof TransactionConfigEntity[keyof TransactionConfigEntity];
      }
    });

    delete entity.createdAt;
    delete entity.updatedAt;
    entity.minAmount = this.formatAmount(entity.minAmount);
    entity.maxAmount = this.formatAmount(entity.maxAmount);
    entity.createdBy = entity.createdBy ?? 'unknown';
    entity.updatedBy = entity.updatedBy ?? 'unknown';

    return this.checkInvariants(entity);
  }

  public static createTransactionConfigEntities(providerMethodId: string,
                                                currencySetting: CurrencySetting): TransactionConfigEntity[] {
    return [
      currencySetting.deposit && this.createDepositConfig(providerMethodId, currencySetting.currency, currencySetting.deposit),
      currencySetting.payout && this.createPayoutConfig(providerMethodId, currencySetting.currency, currencySetting.payout),
      currencySetting.refund && this.createRefundConfig(providerMethodId, currencySetting.currency, currencySetting.refund),
    ].filter(Boolean) as TransactionConfigEntity[];
  }

  public static createByType(type: string, options: TransactionConfigByTypeOptions): TransactionConfigEntity {
    const { providerMethodId, setting, currency } = options;

    if (type === TransactionType.DEPOSIT) {
      return this.createDepositConfig(providerMethodId, currency, setting as DepositSetting);
    } else if (type === TransactionType.PAYOUT) {
      return this.createPayoutConfig(providerMethodId, currency, setting as PayoutSetting);
    } else {
      return this.createRefundConfig(providerMethodId, currency, setting as RefundSetting);
    }
  }

  private static createDepositConfig(providerMethodId: string, currencyIso3: string, depositSetting: DepositSetting): TransactionConfigEntity {
    return this.checkInvariants({
      id: randomUUID(),
      providerMethodId,
      currencyIso3,
      type: TransactionType.DEPOSIT,
      isEnabled: depositSetting.isEnabled,
      minAmount: this.formatAmount(depositSetting.minAmount),
      maxAmount: this.formatAmount(depositSetting.maxAmount),
      period: null,
      order: null,
      createdBy: 'unknown',
      updatedBy: 'unknown',
    });
  }

  private static createPayoutConfig(providerMethodId: string, currencyIso3: string, payoutSetting: PayoutSetting): TransactionConfigEntity {
    return this.checkInvariants({
      id: randomUUID(),
      providerMethodId,
      currencyIso3,
      type: TransactionType.PAYOUT,
      isEnabled: payoutSetting.isEnabled,
      minAmount: this.formatAmount(payoutSetting.minAmount),
      maxAmount: this.formatAmount(payoutSetting.maxAmount),
      period: null,
      order: null,
      createdBy: 'unknown',
      updatedBy: 'unknown',
    });
  }

  private static createRefundConfig(providerMethodId: string, currencyIso3: string, refundSetting: RefundSetting): TransactionConfigEntity {
    return this.checkInvariants({
      id: randomUUID(),
      providerMethodId,
      currencyIso3,
      type: TransactionType.REFUND,
      isEnabled: refundSetting.isEnabled,
      minAmount: this.formatAmount(refundSetting.minAmount),
      maxAmount: null,
      period: refundSetting.period ?? null,
      order: null,
      createdBy: 'unknown',
      updatedBy: 'unknown',
    });
  }

  private static formatAmount(amount: number | null | undefined): number | null {
    if (typeof amount !== 'number') {
      return null;
    }
    return Number(amount.toFixed(4));
  }

  private static checkInvariants(entity: TransactionConfigEntity): TransactionConfigEntity {
    if (entity.minAmount && entity.maxAmount && entity.maxAmount < entity.minAmount) {
      throw new ValidationError(`For ${entity.currencyIso3} ${entity.type} maxAmount is lower than minAmount`);
    }

    return entity;
  }
}
