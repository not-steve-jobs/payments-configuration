import { Entity } from '@core';

/**
 * Table: cp_stpRules
 */
export interface StpRuleEntity extends Entity {
  id: string;
  key: string;
  description: string | null;
  order: number;
  data: string | null;
}
