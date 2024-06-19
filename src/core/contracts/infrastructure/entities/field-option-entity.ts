import { Entity } from '@core';

/**
 * Table: cp_fieldOptions
 */
export interface FieldOptionEntity extends Entity {
  id: string;
  fieldId: string;
  key: string;
  value: string;
  isEnabled: boolean;
}
