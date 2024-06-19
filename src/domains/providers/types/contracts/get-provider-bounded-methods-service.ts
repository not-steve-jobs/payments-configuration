import { CountryAuthorityDto } from '@core/contracts';

export interface GetProviderBoundedMethodsServiceParams {
  providerCode: string;
  countryAuthorities?: CountryAuthorityDto[];
};
