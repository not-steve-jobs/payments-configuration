export interface GetCountriesServiceParams {
  authority?: string;
  providerCode?: string;
}

export interface CountryWithAuthorities {
  countryGroup: string;
  countryData: {
    countryCode: string;
    countryName: string;
    authorities: string[];
  };
}

export interface GetCountriesServiceResponse {
  countries: CountryWithAuthorities[];
}
