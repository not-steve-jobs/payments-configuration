import { Entity, ProviderType } from '@core';

/**
 * Table: cp_providers
 *
 * Represents payment provider (for example: Xpay, Nganluong, etc)
 */
export interface ProviderEntity extends Entity {
  id: string;
  name: string;
  code: string;
  type: ProviderType;
  isEnabled: boolean;
  description: string | null;
  convertedCurrency: string | null;
}
