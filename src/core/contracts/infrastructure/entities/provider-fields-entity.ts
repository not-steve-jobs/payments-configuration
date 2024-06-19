import { Entity, TransactionType } from '@core';

/**
 * Table: cp_providerFields
 *
 * Represents fields of a Provider
 */
export interface ProviderFieldsEntity extends Entity {
  providerCode: string;
  countryIso2: string | null;
  authorityFullCode: string | null;
  currencyIso3: string | null;
  transactionType: TransactionType;
  fields: string;
}

/**
 * Represents a field entity inside `ProviderEntity.fields` json array
 */
export interface DepositField {
  key: string;
  valueType: string;
  defaultValue: string;
  pattern: string;
  isMandatory: boolean;
  isEnabled: boolean;
  options: Option[];
}

/**
 * Represents a field entity inside `ProviderEntity.fields` json array
 */
export interface WithdrawalField {
  key: string;
  name: string;
  valueType: string;
  pattern: string;
  isMandatory: boolean;
  isEnabled: boolean;
  options: Option[];
}

export type Field = DepositField | WithdrawalField;

export interface Option {
  key: string;
  value: string;
  isEnabled: boolean;
}
