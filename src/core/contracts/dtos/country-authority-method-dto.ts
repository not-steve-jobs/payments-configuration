export interface CountryAuthorityMethodWithProvidersDto {
  methodCode: string;
  methodName: string;
  isEnabled: boolean;
  providers: string[];
}

export interface CountryAuthorityMethodDto {
  country: string;
  authority: string;
  methodName: string;
  methodCode: string;
  isEnabled: boolean;
}

export interface CountryAuthorityMethodWithCaIdDto {
  methodCode: string;
  methodName: string;
  countryAuthorityId: string;
  country: string;
  authority: string;
}
