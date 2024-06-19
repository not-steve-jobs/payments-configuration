import { CredentialDto } from '@core';

import { CountryAuthorityBoundedEntityManager } from './country-authority-bounded-entity-manager';

describe('CountryAuthorityBoundedEntityManager', () => {
  it('Should return empty array', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities([], {
      countryIso2: 'CY',
      authorityFullCode: 'CYSEC',
      currencyIso3: 'USD',
      providerCode: 'stripe',
    })).toStrictEqual([]);
  });

  it('Should return empty array if there is no match by authority', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: 'CYSEC', countryIso2: null, currencyIso3: 'USD', credentialsDetails: [{ key: 'one', value: 'one' }] },
      ]),
      {
        providerCode: 'stripe',
        countryIso2: 'CY',
        authorityFullCode: 'GM',
        currencyIso3: 'USD',
      })).toStrictEqual([]);
  });

  it('Should return empty array if there is no match by country', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: 'GM', countryIso2: 'EN', currencyIso3: 'USD', credentialsDetails: [{ key: 'one', value: 'one' }] },
      ]),
      {
        countryIso2: 'CY',
        authorityFullCode: 'GM',
        providerCode: 'stripe',
        currencyIso3: 'USD',
      })).toStrictEqual([]);
  });

  it('Should return empty array if there is no match by currency', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: 'GM', countryIso2: 'CY', currencyIso3: 'USD', credentialsDetails: [{ key: 'one', value: 'one' }] },
      ]),
      {
        countryIso2: 'CY',
        authorityFullCode: 'GM',
        providerCode: 'stripe',
        currencyIso3: 'EUR',
      })).toStrictEqual([]);
  });

  it('Should return credentials by currency', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: null, countryIso2: null, currencyIso3: 'USD', credentialsDetails: [{ key: 'one', value: 'one' }] },
      ]),
      {
        countryIso2: 'CY',
        authorityFullCode: 'CYSEC',
        providerCode: 'stripe',
        currencyIso3: 'USD',
      })).toMatchObject([{
      credentialsDetails: [{ key: 'one', value: 'one' }],
    }]);
  });

  it('Should return credentials by authority/currency', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: 'CYSEC', countryIso2: null, currencyIso3: 'USD', credentialsDetails: [{ key: 'one', value: 'one' }] },
      ]),
      {
        countryIso2: 'CY',
        authorityFullCode: 'CYSEC',
        providerCode: 'stripe',
        currencyIso3: 'USD',
      })).toMatchObject([
      { credentialsDetails: [{ key: 'one', value: 'one' }] },
    ]);
  });

  it('Should return credentials by authority/country/currency', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: 'CYSEC', countryIso2: 'CY', currencyIso3: 'USD', credentialsDetails: [{ key: 'one', value: 'one' }]  },
      ]),
      {
        countryIso2: 'CY',
        authorityFullCode: 'CYSEC',
        providerCode: 'stripe',
        currencyIso3: 'USD',
      })).toMatchObject([
      { credentialsDetails: [{ key: 'one', value: 'one' }] },
    ]);
  });

  it('Should return two credentials including common', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: null, countryIso2: null, currencyIso3: null, credentialsDetails: [{ key: 'one', value: 'one' }]  },
        { providerCode: 'stripe', authorityFullCode: 'CYSEC', countryIso2: 'CY', currencyIso3: 'USD', credentialsDetails: [{ key: 'two', value: 'two' }] },
      ]),
      {
        countryIso2: 'CY',
        authorityFullCode: 'CYSEC',
        providerCode: 'stripe',
        currencyIso3: 'USD',
      })).toMatchObject([
      { credentialsDetails: [{ key: 'one', value: 'one' }] },
      { credentialsDetails: [{ key: 'two', value: 'two' }] },
    ]);
  });

  it('Should return if have lowerCase params', () => {
    expect(CountryAuthorityBoundedEntityManager.getBoundedEntities(
      mock<CredentialDto[]>([
        { providerCode: 'stripe', authorityFullCode: null, countryIso2: null, currencyIso3: null, credentialsDetails: [{ key: 'one', value: 'one' }] },
        { providerCode: 'stripe', authorityFullCode: 'CYSEC', countryIso2: 'CY', currencyIso3: 'USD', credentialsDetails: [{ key: 'two', value: 'two' }] },
      ]),
      {
        countryIso2: 'cy',
        authorityFullCode: 'cysec',
        providerCode: 'stripe',
        currencyIso3: 'usd',
      })).toMatchObject([
      { credentialsDetails: [{ key: 'one', value: 'one' }] },
      { credentialsDetails: [{ key: 'two', value: 'two' }] },
    ]);
  });
});
