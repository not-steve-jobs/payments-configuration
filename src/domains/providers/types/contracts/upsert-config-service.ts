import { CountryAuthorityMethodDto, ProviderDto } from '@core/contracts/dtos';
import { CountryAuthorityEntity, MethodEntity } from '@core/contracts/infrastructure/entities';

export interface CountryAuthorityMethods {
  countryAuthority: CountryAuthorityEntity;
  method: MethodEntity;
}

export interface CountryAuthorityProviderMethodConfig {
  country: string;
  authority: string;
  methodName: string;
  methodCode: string;
  isEnabled: boolean;
}

export interface ProviderUpsertDto {
  name: string;
  code: string;
}

export interface CountryAuthorityMethodUpsertDto {
  country: string;
  authority: string;
  method: string;
}

export interface UpsertConfigServiceParams {
  provider: ProviderUpsertDto;
  countryAuthorityMethods: CountryAuthorityMethodUpsertDto[];
}

export interface UpsertConfigServiceResponse {
  provider: ProviderDto;
  countryAuthorityMethods: CountryAuthorityMethodDto[];
}
