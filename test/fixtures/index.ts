import {
  AuthorityEntity,
  CountryAuthorityMethodWithProvidersEntity,
  CountryEntity,
  CountryWithAuthoritiesDto,
  StpProviderRuleEntity,
} from '@core';

export const fscmAuthority = mock<AuthorityEntity>({ fullCode: 'FSCM', name: 'Mauritius' });
export const gmAuthority = mock<AuthorityEntity>({ fullCode: 'GM', name: 'Global Markets' });
export const cysecAuthority = mock<AuthorityEntity>({ fullCode: 'CYSEC', name: 'Cyprus-based' });
export const ukAuthority = mock<AuthorityEntity>({ fullCode: 'FCA', name: 'UK' });

export const singapore = mock<CountryEntity>({ iso2: 'SG', name: 'Singapore', group: 'Asia' });
export const armenia = mock<CountryEntity>({ iso2: 'AR', name: 'Armenia', group: 'Asia' });

export const countryWithAuthorityFullCodeList: CountryWithAuthoritiesDto[] = [
  { ...singapore, authorities: [fscmAuthority.fullCode, gmAuthority.fullCode].join(',') },
  { ...armenia, authorities: [fscmAuthority.fullCode, gmAuthority.fullCode, cysecAuthority.fullCode].join(',') },
];

export const countryAuthorityMethodsWithProviders = [
  { methodName: 'Visa/Mastercard', methodCode: 'cards', isEnabled: true, providers: 'Stripe,Ingenico' },
  { methodName: 'Bitcoin', methodCode: 'btc', isEnabled: true, providers: 'Orbital' },
].map(e => mock<CountryAuthorityMethodWithProvidersEntity>(e));

export const usdCurrency = { iso3: 'USD', iso2: 'US', name: 'US dollar' };
export const eurCurrency = { iso3: 'EUR', iso2: 'EU', name: 'Euro' };

export const stpProviderRuleMockIsEnabled: StpProviderRuleEntity = {
  authorityFullCode: '',
  countryIso2: 'countryIso2',
  data: '[{ "id": 1, "isEnabled": true, "key": "key", "order": 1 }]',
  id: '1',
  isEnabled: true,
  providerCode: '',
};

export const stpProviderRuleMockIsEnabledFalse: StpProviderRuleEntity = {
  authorityFullCode: '',
  countryIso2: 'countryIso2',
  data: null,
  id: '1',
  isEnabled: false,
  providerCode: '',
};

export const stpRuleMock = [{ key: 'key', order: 1, id: 11, description: 'description' }];
