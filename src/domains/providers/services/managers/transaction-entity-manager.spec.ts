import casual from 'casual';

import { TransactionConfigEntity, TransactionType } from '@core';
import { CurrencySetting } from '@domains/providers';

import { TransactionEntityManager } from './transanction-entity-manager';

describe('TransactionEntityManager', () => {
  it('Should return only deposit transaction', () => {
    const providerMethodId = casual.uuid;
    const currencySetting: CurrencySetting = {
      currency: 'EUR',
      deposit: {
        minAmount: 10_000,
        maxAmount: 100_000,
        isEnabled: true,
      },
    };
    const depositTransaction: TransactionConfigEntity = {
      id: expect.any(String),
      providerMethodId: providerMethodId,
      currencyIso3: 'EUR',
      type: TransactionType.DEPOSIT,
      isEnabled: true,
      minAmount: 10_000,
      maxAmount: 100_000,
      period: null,
      order: null,
      createdBy: expect.any(String),
      updatedBy: expect.any(String),
    };

    const result = TransactionEntityManager.createTransactionConfigEntities(providerMethodId, currencySetting);

    expect(result).toHaveLength(1);
    expect(result).toStrictEqual([depositTransaction]);
  });

  it('Should return all 3 transactions', () => {
    const providerMethodId = casual.uuid;
    const currencySetting: CurrencySetting = {
      currency: 'EUR',
      deposit: {
        minAmount: 10_000,
        maxAmount: 100_000,
        isEnabled: true,
      },
      payout: {
        minAmount: 20_000,
        maxAmount: 200_000,
        isEnabled: false,
      },
      refund: {
        minAmount: 30_000,
        period: 180,
        isEnabled: true,
      },
    };
    const depositTransaction: TransactionConfigEntity = {
      id: expect.any(String),
      providerMethodId: providerMethodId,
      currencyIso3: 'EUR',
      type: TransactionType.DEPOSIT,
      isEnabled: true,
      minAmount: 10_000,
      maxAmount: 100_000,
      period: null,
      order: null,
      createdBy: expect.any(String),
      updatedBy: expect.any(String),
    };
    const payoutTransaction: TransactionConfigEntity = {
      id: expect.any(String),
      providerMethodId: providerMethodId,
      currencyIso3: 'EUR',
      type: TransactionType.PAYOUT,
      isEnabled: false,
      minAmount: 20_000,
      maxAmount: 200_000,
      period: null,
      order: null,
      createdBy: expect.any(String),
      updatedBy: expect.any(String),
    };
    const refundTransaction: TransactionConfigEntity = {
      id: expect.any(String),
      providerMethodId: providerMethodId,
      currencyIso3: 'EUR',
      type: TransactionType.REFUND,
      isEnabled: true,
      minAmount: 30_000,
      maxAmount: null,
      period: 180,
      order: null,
      createdBy: expect.any(String),
      updatedBy: expect.any(String),
    };

    const result = TransactionEntityManager.createTransactionConfigEntities(providerMethodId, currencySetting);

    expect(result).toHaveLength(3);
    expect(result).toStrictEqual([depositTransaction, payoutTransaction, refundTransaction]);
  });
});
