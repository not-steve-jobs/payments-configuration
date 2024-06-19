import { Entity } from '@core';

/**
 * Table: cp_currencies
 */
export interface CurrencyEntity extends Entity {
  iso3: string;
}
