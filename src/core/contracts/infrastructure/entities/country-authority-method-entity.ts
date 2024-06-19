import { Entity } from '@core';

/**
 * Table: cp_countryAuthorityMethods.
 *
 * Represents Payment method (cards, btc, etc.) for specific country and authority (jurisdiction)
 */
export interface CountryAuthorityMethodEntity extends Entity {
  id: string;
  countryAuthorityId: string;
  methodId: string;
  isEnabled: boolean;
  depositsOrder: number | null;
}

export interface CountryAuthorityMethodWithCodeDto extends CountryAuthorityMethodEntity {
  code: string;
}

export interface CountryAuthorityMethodWithProvidersEntity extends CountryAuthorityMethodEntity {
  providers: string;
  methodName: string;
  methodCode: string;
}

