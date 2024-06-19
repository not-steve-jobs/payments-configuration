import { Entity } from '@core';

/**
 * Table cp_transactionConfigs
 *
 * Represents config of specific transaction (deposit, refund, etc.) for specific provider method and specific currency
 */
export interface TransactionConfigEntity extends Entity {
  id: string;
  providerMethodId: string;
  currencyIso3: string;
  type: string;
  isEnabled: boolean;
  minAmount: number | null;
  maxAmount: number | null;
  period: number | null;
  order: number | null;
}
