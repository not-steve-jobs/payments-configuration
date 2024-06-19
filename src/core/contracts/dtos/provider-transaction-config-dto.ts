import { ProviderType, TransactionType } from '@core';

export interface TransactionConfigDto {
  methodCode: string;
  methodName: string;
  providerId: string;
  providerCode: string;
  providerName: string;
  providerType: ProviderType;
  isProviderMethodEnabled: boolean;
  isPayoutAsRefund: boolean;
  refundsOrder: number;
  payoutsOrder: number;
  isPaymentAccountRequired: boolean;
  currencyIso3: string;
  type: TransactionType;
  order: number;
  minAmount: number | null;
  maxAmount: number | null;
  period: number | null;
  isEnabled: boolean;
  providerMethodId: string;
  convertedCurrency: string | null;
  defaultCurrency: string | null;
}
