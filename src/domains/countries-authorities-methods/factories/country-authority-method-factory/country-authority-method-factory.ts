import { CountryAuthorityMethodWithProvidersDto, CountryAuthorityMethodWithProvidersEntity } from '@core';

export class CountryAuthorityMethodFactory {
  public static createDtoWithProviders(entity: CountryAuthorityMethodWithProvidersEntity): CountryAuthorityMethodWithProvidersDto {
    return {
      methodCode: entity.methodCode,
      methodName: entity.methodName,
      isEnabled: entity.isEnabled,
      providers: entity.providers
        ? Array.from(new Set(entity.providers.split(',')))
        : [],
    };
  }
}
