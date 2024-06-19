import { Entity } from '@core';

/**
 * Table: cp_countries
 */
export interface CountryEntity extends Entity {
  iso2: string;
  iso3: string;
  name: string;
  group: string;
  adminApiId: number | null;
}
