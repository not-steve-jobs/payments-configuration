import { FieldWithOptionsDto, SpecificFieldsDto } from '../dtos';

export interface GetProviderFieldsServiceParams {
  providerCode: string;
}

export interface GetFieldsServiceResponse {
  common: FieldWithOptionsDto[];
  specific: SpecificFieldsDto[];
}
