import { ApplicationPlatforms, Entity } from '@core';

/**
 * Table: cp_providerRestrictions
 *
 * Represents provider restrictions by platform version
 */
export interface ProviderRestrictionsEntity extends Entity {
  providerCode: string;
  countryAuthorityId: string | null;
  isEnabled: boolean;
  platform: ApplicationPlatforms;
  settings: string; // value-object
}

