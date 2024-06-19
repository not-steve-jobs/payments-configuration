import { CountryAuthorityDto, CountryAuthorityEntity } from '@core';

export class CountryAuthorityMapper {
  public static mapToDto(countryAuthority: CountryAuthorityEntity): CountryAuthorityDto {
    return {
      authority: countryAuthority.authorityFullCode,
      country: countryAuthority.countryIso2,
    };
  }
}
