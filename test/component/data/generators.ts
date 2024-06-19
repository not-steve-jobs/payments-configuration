import casual from 'casual';

import { ApplicationPlatforms, Authority } from '@core';
import { CurrencySetting, ProviderRestrictionsGroupDto } from '@domains/providers';
import { LooseObject } from '@internal/component-test-library';
import { Components } from '@typings/openapi';

import { ChangeProviderMethodParameter, CommonQueryParameter } from '../constant';

export function generateCommonAuthorityAndCountryQueryParameters({
  country,
  authority,
}: Partial<{ country: string; authority: string }> = {}): LooseObject {
  return {
    [CommonQueryParameter.AUTHORITY]: authority || casual.random_value([Authority.FSCM, Authority.GM, Authority.CYSEC]),
    [CommonQueryParameter.COUNTRY]: country || 'AR',
  };
}

export function generateGetDepositsQueryParameters({
  country,
  authority,
  platform,
  version,
}: Partial<{ country: string; authority: string; platform?: string; version?: string }> = {}): LooseObject {
  return {
    ...generateCommonAuthorityAndCountryQueryParameters({ country, authority }),
    platform: platform || '',
    version: version || '',
  };
}

export function generateMethodCode(): string {
  return casual.string.slice(0, 50);
}

export function generateChangeProviderMethodPayload({
  providerCode,
  currencySettings,
  isEnabled,
}: Partial<{ providerCode: string; currencySettings: CurrencySetting[]; isEnabled: boolean }> = {}): {
    providerCode: string;
    currencySettings: CurrencySetting[];
    isEnabled: boolean;
  } {
  return {
    [ChangeProviderMethodParameter.PROVIDER_CODE]: providerCode || casual.string,
    [ChangeProviderMethodParameter.CURRENCY_SETTINGS]: currencySettings || [],
    [ChangeProviderMethodParameter.IS_ENABLED]: typeof isEnabled !== 'undefined' ? isEnabled : true,
  };
}

export function generateUpsertConfigServicePayload({
  provider,
  countryAuthorityMethods,
}: Partial<LooseObject> = {}): LooseObject {
  const defaultProviderPayload: LooseObject = {
    name: 'Stripe',
    code: 'stripe',
  };
  const defaultCountryAuthorityMethods: LooseObject[] = [{ country: 'AR', authority: 'GM', method: 'cards' }];

  return {
    provider: provider ?? defaultProviderPayload,
    countryAuthorityMethods: countryAuthorityMethods ?? defaultCountryAuthorityMethods,
  };
}

export function generateProviderRestrictionsGroupDto(options: Partial<ProviderRestrictionsGroupDto> = {}): LooseObject {
  return {
    platform: ApplicationPlatforms.IOS,
    isEnabled: true,
    countriesAuthorities: [],
    settings: [{ condition: 'gte', version: '0.0.1' }],
    ...options,
  };
}

export function generateMethodDto(methodDto: Partial<Components.Schemas.MethodDto> = {}): Components.Schemas.MethodDto {
  return {
    name: methodDto.name ?? casual.word,
    description: methodDto.description ?? casual.word,
    code: methodDto.code ?? casual.word,
  };
}

export function generateStpRuleDto(): LooseObject {
  return {
    id: '1',
    key: 'test_key',
    description: 'test_desc',
    order: 123,
    data: '[{ "id": 123, "isEnabled": true, "key": "test_key", "order": 321 }]',
  };
}

export function generateStpProviderRuleDto(): LooseObject {
  return {
    providerCode: 'stripe',
    authorityFullCode: 'bb',
    countryIso2: 'I2',
    isEnabled: true,
    data: '[{ "id": 123, "isEnabled": true, "key": "test_key", "order": 321 }]',
  };
}
