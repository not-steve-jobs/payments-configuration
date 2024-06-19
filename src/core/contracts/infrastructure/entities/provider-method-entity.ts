import { Entity } from '@core';

export interface ProviderMethodDefaultCurrency {
  isEnabled: boolean;
  currency: string;
}

/**
 * Table: cp_providerMethods
 *
 * Represents config of payment method implementation by a specific provider.
 */
export interface ProviderMethodEntity extends Entity {
  id: string;
  countryAuthorityMethodId: string;
  providerId: string;
  credentialsId?: string;
  isEnabled: boolean;
  isPayoutAsRefund: boolean;
  isPaymentAccountRequired: boolean;
  refundsOrder: number;
  payoutsOrder: number;
  defaultCurrency: string | null;
}
