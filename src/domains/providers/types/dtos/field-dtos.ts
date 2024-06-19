import { CountryAuthorityDto, FieldOptionDto, TransactionType } from '@core';

export interface SpecificFieldsParameters {
  countriesAuthorities: CountryAuthorityDto[];
  currencies: string[];
}

export interface SpecificFieldsDto {
  parameters: SpecificFieldsParameters;
  fields: FieldWithOptionsDto[];
}

export interface FieldWithOptionsDto {
  key: string;
  transactionType: TransactionType;
  fieldType: string;
  name?: string;
  defaultValue?: string;
  pattern: string;
  isMandatory: boolean;
  isEnabled: boolean;
  options: FieldOptionDto[];
}

export interface SpecificFieldWithOptionDto {
  authority: string;
  country: string;
  currency: string;
  key: string;
  value: string;
  valueType: string;
  transactionType: TransactionType;
  isEnabled: boolean;
  isMandatory: boolean;
  defaultValue: string | null;
  pattern: string;
  optionKey: string;
  optionValue: string;
  optionIsEnabled: boolean;
}

export interface ProviderFields {
  common: FieldWithOptionsDto[];
  specific: SpecificFieldsDto[];
}
