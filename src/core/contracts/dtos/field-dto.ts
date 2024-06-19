import { FieldEntityType, FieldOption, TransactionType } from '@core/contracts';

export interface FieldDto {
  key: string;
  name: string;
  type: string;
  required: boolean;
  options: FieldOption[];
  validation: string;
}

export interface ConfigFieldWithOptionDto {
  entityId: string;
  entityType: FieldEntityType;
  key: string;
  value: string | null;
  valueType: string;
  transactionType: TransactionType;
  isEnabled: boolean;
  isMandatory: boolean;
  defaultValue: string | null;
  pattern: string;
  optionId: string;
  optionKey: string;
  optionValue: string;
  optionIsEnabled: boolean;
  currencyIso3: string;
}

export interface ConfigFieldWithOptionDtoLegacy {
  providerMethodId: string;
  key: string;
  value: string;
  valueType: string;
  transactionType: TransactionType;
  isMandatory: boolean;
  isEnabled: boolean;
  defaultValue: string | null;
  pattern: string | null;
  optionId: string;
  optionKey: string;
  optionValue: string;
  optionIsEnabled: boolean;
}
