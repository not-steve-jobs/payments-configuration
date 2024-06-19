import { Entity } from '@core/contracts';

/**
 * Table: cp_stpProviderRules
 */
export interface StpProviderRuleEntity extends Entity {
  providerCode: string;
  authorityFullCode: string;
  countryIso2: string | null;
  isEnabled: boolean;
  data: string | null;
}

/**
 * Represents a rule entity inside `StpProviderRuleEntity.data` json array
 */
export interface StpProviderRuleDto {
  key: string;
  type?: string;
  isEnabled: true;
  value?: string | string[];
}

