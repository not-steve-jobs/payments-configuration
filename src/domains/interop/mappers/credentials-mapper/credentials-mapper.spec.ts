import casual from 'casual';

import { CredentialDto } from '@core/contracts/dtos';

import { CredentialsMapper } from './credentials-mapper';

describe('CredentialsMapper', () => {
  it('Should map to credentials key value config with shared credentials', () => {
    const credentials = mock<CredentialDto[]>([
      { credentialsDetails: [{ key: '1', value: '2' }], currencyIso3: null, countryIso2: casual.string, authorityFullCode: casual.string },
      { credentialsDetails: [{ key: '3', value: '4' }], currencyIso3: 'USD', countryIso2: casual.string, authorityFullCode: casual.string },
    ]);

    const response = CredentialsMapper.mapToCredentialsDto(credentials, 'usd');

    expect(response).toStrictEqual([
      { key: '1', value: '2' },
      { key: '3', value: '4' },
    ]);
  });

  it('Should return only shared credentials', () => {
    const credentials = mock<CredentialDto[]>([
      { credentialsDetails: [{ key: '1', value: '2' }], currencyIso3: null, countryIso2: casual.string, authorityFullCode: casual.string },
      { credentialsDetails: [{ key: '3', value: '4' }], currencyIso3: 'USD', countryIso2: casual.string, authorityFullCode: casual.string },
    ]);

    const response = CredentialsMapper.mapToCredentialsDto(credentials, 'eur');

    expect(response).toStrictEqual([
      { key: '1', value: '2' },
    ]);
  });
});
