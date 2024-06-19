import { Entity } from './entity';

/**
 * Table: cp_stpProviderRules
 *
 * Represents Straight-Through Processing (STP) rules for a specific provider
 */
export interface StpProviderRulesEntity extends Entity {
  providerCode: string;
  authorityFullCode: string;
  countryIso2: string | null;
  data: string | null;
  isEnabled: boolean;
}
