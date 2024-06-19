import { Entity } from '@core';

/**
 * Table: cp_methods
 *
 * Represents type of payment (for example: cards, bitcoin, local bank transfer, etc)
 */
export interface MethodEntity extends Entity {
  id: string;
  code: string;
  name: string;
  description: string;
}
