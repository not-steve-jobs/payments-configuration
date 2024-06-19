import { Entity } from '@core';

/**
 * Table: cp_countriesAuthorities
 */
export interface CountryAuthorityEntity extends Entity {
  id: string;
  authorityFullCode: string;
  countryIso2: string;
  adminApiId: number | null;
}
