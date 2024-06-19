export const CommonQueryParameter = {
  AUTHORITY: 'authority',
  COUNTRY: 'country',
} as const;

export const CommonMandatoryQueryParameters = [
  CommonQueryParameter.AUTHORITY,
  CommonQueryParameter.COUNTRY,
] as const;

export const ChangeProviderMethodParameter = {
  PROVIDER_CODE: 'providerCode',
  IS_ENABLED: 'isEnabled',
  CURRENCY_SETTINGS: 'currencySettings',
} as const;

export const UpsertConfigParameters = {
  PROVIDER: 'provider',
  COUNTRY_AUTHORITY_METHOD: 'countryAuthorityMethods',
} as const;

export const UpdateFieldsParameters = {
  COMMON: 'common',
  SPECIFIC: 'specific',
} as const;
