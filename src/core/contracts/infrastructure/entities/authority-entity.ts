import { Entity } from '@core';

/**
 * Table: cp_authorities
 */
export interface AuthorityEntity extends Entity {
  fullCode: string;
  name: string;
}
