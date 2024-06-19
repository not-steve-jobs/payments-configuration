import casual from 'casual';

import { ApplicationPlatforms, ProviderRestrictionsEntity } from '@core';
import { DbTable } from '@internal/component-test-library';

import { Builder } from './abstract-builder';

export class ProviderRestrictionBuilder extends Builder<ProviderRestrictionsEntity> {
  public tableName = DbTable.cpProviderRestrictions;

  protected getNewEntity(payload: Partial<ProviderRestrictionsEntity>): ProviderRestrictionsEntity {
    return {
      providerCode: payload.providerCode!,
      countryAuthorityId: payload.countryAuthorityId ?? null,
      platform: payload.platform || casual.random_value(ApplicationPlatforms),
      isEnabled: this.getValueOrDefault(payload.isEnabled, true),
      settings: payload.settings || JSON.stringify([]),
    };
  }
}
