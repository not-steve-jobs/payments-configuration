import request from 'supertest';

import { DataSet, DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

async function seed(country: string,  authority: string): Promise<DataSet> {
  const dataSet = await DataSetBuilder
    .create()
    .withCountry({ iso2: country })
    .withCurrency({ iso3: 'EUR' })
    .withAuthority({ fullCode: authority })
    .withConfigs({ isEnabled: true })
    .withProviderMethod({ isEnabled: true })
    .withCountryAuthorityMethod({ isEnabled: true })
    .withCredential()
    .withBankAccount({ currencyIso3: 'EUR' })
    .build();

  await DataSetBuilder
    .create()
    .withCountry({ iso2: 'IL' })
    .withAuthority({ fullCode: 'GM' })
    .withCredential({
      providerCode: dataSet.provider.code,
      countryIso2: 'IL',
      authorityFullCode: 'GM',
    })
    .withBankAccount({
      providerCode: dataSet.provider.code,
      countryIso2: 'IL',
      authorityFullCode: 'GM',
      currencyIso3: 'EUR',
    })
    .build();

  return dataSet;
}

describe('ReturnOnlyBoundedInCountryAuthority', () => {
  const sendRequest = (authority: string, country: string): request.Test =>
    request(baseUrl)
      .get(`api/interop/configs?authority=${authority}&country=${country}`);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should return configs for specific CA', async () => {
    const authority = 'CYSEC';
    const country = 'CY';

    const dataSet = await seed(country, authority);

    const { statusCode, body } = await sendRequest(authority, country);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].currency).toBe('EUR');
    expect(body[0].providers).toHaveLength(1);
    expect(body[0].providers[0].config).toStrictEqual(JSON.parse(dataSet.credential.credentialsDetails));
    expect(body[0].providers[0].accounts).toStrictEqual([
      {
        name: dataSet.bankAccount.name,
        type: dataSet.bankAccount.type,
        config: JSON.parse(dataSet.bankAccount.configs),
      },
    ]);
  });
});
