import { Entity, FieldEntityType, TransactionType } from '@core';

export const DEFAULT_FIELD_PATTERN = '.+';

/**
 * Table: cp_fields
 */
export interface FieldEntity extends Entity {
  id: string;
  entityId: string;
  entityType: FieldEntityType;
  transactionType: TransactionType;
  currencyIso3: string;
  key: string;
  valueType: string;
  value: string | null;
  defaultValue: string | null;
  pattern: string;
  isMandatory: boolean;
  isEnabled: boolean;
  adminApiId: number | null;
}

export type UnboundedFieldEntity = Omit<FieldEntity, 'entityId' | 'entityType'>
