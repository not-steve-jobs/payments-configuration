import { FieldEntity, FieldOptionEntity, UnboundedFieldEntity } from '@core/contracts';

import { FieldWithOptionsDto, SpecificFieldsDto } from '../dtos';

export interface SpecificFieldsFlatGroupDto {
  country: string;
  authority: string;
  currency: string | null;
  fields: FieldWithOptionsDto[];
}

export interface FieldOptionUpdateDto {
  key: string;
  value: string;
  isEnabled: boolean;
}

export interface UpsertProviderFieldsServiceReqBody {
  common: FieldWithOptionsDto[];
  specific: SpecificFieldsDto[];
}

export interface UpsertProviderFieldsServiceQueryParams {
  providerCode: string;
}

export type UpsertProviderFieldsServiceParams = UpsertProviderFieldsServiceReqBody & UpsertProviderFieldsServiceQueryParams

export interface UpsertProviderFieldsServiceResponse {
  common: FieldWithOptionsDto[];
  specific: SpecificFieldsDto[];
}

export interface FieldsWithOptions {
  fields: FieldEntity[];
  options: FieldOptionEntity[];
}

export interface UnboundedFieldsWithOptions {
  fields: UnboundedFieldEntity[];
  options: FieldOptionEntity[];
}

export interface FieldsWithOptionsSpecific {
  country: string;
  authority: string;
  currency: string | null;
  fieldsWithOptionsUnbounded: UnboundedFieldsWithOptions;
  fieldsWithOptions: FieldsWithOptions;
}
