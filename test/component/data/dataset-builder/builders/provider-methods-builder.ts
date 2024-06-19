import { randomUUID } from 'crypto';

import { DbTable } from '@internal/component-test-library';
import { ProviderMethodEntity } from '@core';

import { Builder } from './abstract-builder';

export class ProviderMethodsBuilder extends Builder<ProviderMethodEntity> {
  public tableName = DbTable.cpProviderMethods;

  protected getNewEntity(payload: Partial<ProviderMethodEntity>): ProviderMethodEntity {
    return {
      id: payload.id || randomUUID(),
      countryAuthorityMethodId: payload.countryAuthorityMethodId!,
      providerId: payload.providerId!,
      credentialsId: payload.credentialsId,
      isEnabled: payload.isEnabled || false,
      isPayoutAsRefund: payload.isPayoutAsRefund || false,
      isPaymentAccountRequired: payload.isPaymentAccountRequired || false,
      refundsOrder: payload.refundsOrder ?? 0,
      payoutsOrder: payload.payoutsOrder ?? 0,
      defaultCurrency: payload.defaultCurrency || null,
    };
  }
}
