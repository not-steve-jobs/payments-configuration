import { CredentialDto } from '@core';

import { CredentialsDataMapper } from './credentials-data-mapper';

describe('CredentialsDataMapper', () => {
  it('Should return empty array', () => {
    expect(CredentialsDataMapper.mapToCredentialsData([])).toStrictEqual([]);
  });

  it('Should return only common fields', () => {
    const credentials = mock<CredentialDto[]>([
      {
        providerCode: 'corefy',
        authorityFullCode: null,
        countryIso2: null,
        currencyIso3: null,
        credentialsDetails: [
          { key: 'one', value: '1' },
          { key: 'two', value: '2' },
          { key: 'three', value: '3' },
        ],
      },
    ]);

    expect(CredentialsDataMapper.mapToCredentialsData(credentials)).toStrictEqual( [
      {
        parameters: {},
        credentialsDetails: [
          { key: 'one', value: '1' },
          { key: 'two', value: '2' },
          { key: 'three', value: '3' },
        ],
      },
    ]);
  });

  it('Should return common and specific fields', () => {
    const credentials = mock<CredentialDto[]>([
      {
        providerCode: 'corefy',
        authorityFullCode: null,
        countryIso2: null,
        currencyIso3: null,
        credentialsDetails: [
          { key: 'one', value: '1' },
          { key: 'two', value: '2' },
          { key: 'three', value: '3' },
        ],
      },
      {
        providerCode: 'corefy',
        authorityFullCode: 'CYSEC',
        countryIso2: null,
        currencyIso3: null,
        credentialsDetails: [
          { key: 'four', value: '4' },
        ],
      },
    ]);

    expect(CredentialsDataMapper.mapToCredentialsData(credentials)).toStrictEqual([
      {
        parameters: {},
        credentialsDetails: [
          { key: 'one', value: '1' },
          { key: 'two', value: '2' },
          { key: 'three', value: '3' },
        ],
      },
      {
        parameters: { authority: 'CYSEC' },
        credentialsDetails: [{ key: 'four', value: '4' }],
      },
    ]);
  });

  it.each([
    {
      credential: { authorityFullCode: 'CYSEC', countryIso2: null, currencyIso3: null },
      parameters: { authority: 'CYSEC' },
    },
    {
      credential: { authorityFullCode: 'CYSEC', countryIso2: 'NG', currencyIso3: null },
      parameters: { authority: 'CYSEC', country: 'NG' },
    },
    {
      credential: { authorityFullCode: 'CYSEC', countryIso2: 'NG', currencyIso3: 'USD' },
      parameters: { authority: 'CYSEC', country: 'NG', currency: 'USD' },
    },
    {
      credential: { authorityFullCode: 'CYSEC', countryIso2: null, currencyIso3: 'USD' },
      parameters: { authority: 'CYSEC', currency: 'USD' },
    },
    {
      credential: { authorityFullCode: null, countryIso2: null, currencyIso3: 'USD' },
      parameters: { currency: 'USD' },
    },
  ])('Should return $parameters for $credential', ({ credential, parameters }) => {
    const credentials = mock<CredentialDto[]>([{ providerCode: 'corefy', credentialsDetails: [{ key: 'one', value: '1' }], ...credential }]);

    expect(CredentialsDataMapper.mapToCredentialsData(credentials)).toStrictEqual([
      { parameters, credentialsDetails: [{ key: 'one', value: '1' }] },
    ]);
  });
});
