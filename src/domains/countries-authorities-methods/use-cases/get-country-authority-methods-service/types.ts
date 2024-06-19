import { CountryAuthorityMethodWithProvidersDto } from '@core/contracts';

export interface GetCountryAuthorityMethodsServiceParams {
  authority: string;
  country: string;
}

export interface GetCountryAuthorityMethodsServiceResponse {
  paymentMethodConfigs: CountryAuthorityMethodWithProvidersDto[];
}
