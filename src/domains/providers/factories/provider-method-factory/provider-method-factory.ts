import { randomUUID } from 'crypto';

import { ProviderMethodEntity } from '@core';

export class ProviderMethodFactory {
  public static createEntityModel(payload: {
    countryAuthorityMethodId: string;
    providerId: string;
    isEnabled: boolean;
    isPayoutAsRefund?: boolean;
    isPaymentAccountRequired?: boolean;
    payoutsOrder?: number;
    refundsOrder?: number;
  }): ProviderMethodEntity {
    return {
      id: randomUUID(),
      countryAuthorityMethodId: payload.countryAuthorityMethodId,
      providerId: payload.providerId,
      isEnabled: payload.isEnabled,
      isPayoutAsRefund: payload.isPayoutAsRefund ?? false,
      isPaymentAccountRequired: payload.isPaymentAccountRequired ?? false,
      payoutsOrder: payload.payoutsOrder ?? 1,
      refundsOrder: payload.refundsOrder ?? 1,
      defaultCurrency: null,
    };
  }
}
