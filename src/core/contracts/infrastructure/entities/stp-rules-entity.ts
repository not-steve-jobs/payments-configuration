import { Entity } from './entity';

/**
 * Table: cp_stpRules
 *
 * Represents Straight-Through Processing (STP) rules
 */
export interface StpRulesEntity extends Entity {
  key: string;
  description: string | null;
  order: number;
  data: string | null;
  createdAt: Date;
  updatedAt: Date;
}
