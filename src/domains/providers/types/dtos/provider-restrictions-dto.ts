import { ApplicationPlatforms, CountryAuthorityDto } from '@core';

export enum Condition {
  GTE = 'gte',
  LTE = 'lte',
  EQ = 'eq',
}

export interface ProviderRestrictionSettings {
  condition: Condition;
  version: string;
}

export interface ProviderRestrictionsDto {
  providerCode: string;
  authority: string | null;
  country: string | null;
  isEnabled: boolean;
  platform: ApplicationPlatforms;
  settings: string;
}

export interface ProviderRestrictionsGroupDto {
  platform: ApplicationPlatforms;
  isEnabled: boolean;
  countriesAuthorities: CountryAuthorityDto[];
  settings: ProviderRestrictionSettings[];
}
