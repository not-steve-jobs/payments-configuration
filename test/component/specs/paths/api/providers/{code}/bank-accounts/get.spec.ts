import request from 'supertest';

import { NotFoundError } from '@internal/errors-library';
import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';

describe('GET /api/providers/{code}/bank-accounts/', () => {
  const sendRequest = (providerCode: string): request.Test =>
    request(baseUrl)
      .get(`api/providers/${providerCode}/bank-accounts`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw if has unknown providerCode', async () => {
    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: 'Unknown Provider',
      code: NotFoundError.code,
      meta: { id: '{"code":"test"}' },
    });
  });

  it('Should return empty array if there is no any data', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ bankAccountsData: [] });
  });

  it('Should return bank accounts with null countries', async () => {
    await DataSetBuilder.create()
      .withProvider({ code: 'test' })
      .withAuthority({ fullCode: 'GM' })
      .withCurrency({ iso3: 'EUR' })
      .withBankAccount({ name: 'bank', type: 'bankAccount', countryIso2: null })
      .build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      bankAccountsData: [
        {
          parameters: {
            countryAuthorities: [{ authority: 'GM', country: null }],
            currencies: ['EUR'],
          },
          bankAccounts: [{ name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
        },
      ],
    });
  });

  it('Should return bank accounts', async () => {
    await DataSetBuilder.create()
      .withProvider({ code: 'test' })
      .withAuthority({ fullCode: 'GM' })
      .withCountry({ iso2: 'CY' })
      .withCurrency({ iso3: 'EUR' })
      .withBankAccount({ name: 'bank', type: 'bankAccount' })
      .build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      bankAccountsData: [
        {
          parameters: {
            countryAuthorities: [{ authority: 'GM', country: 'CY' }],
            currencies: ['EUR'],
          },
          bankAccounts: [{ name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
        },
      ],
    });
  });

  it('Should return bank accounts grouped by configs when currency, country and authority are same', async () => {
    await DataSetBuilder.create()
      .withProvider({ code: 'test' })
      .withAuthority({ fullCode: 'GM' })
      .withCountry({ iso2: 'CY' })
      .withCurrency({ iso3: 'EUR' })
      .withBankAccount({ name: 'bank', type: 'bankAccount', configs: JSON.stringify([{ key: '1', value: '1' }]) })
      .build();

    await DataSetBuilder.create()
      .withProvider({ code: 'test' })
      .withAuthority({ fullCode: 'GM' })
      .withCountry({ iso2: 'CY' })
      .withCurrency({ iso3: 'ZAR' })
      .withBankAccount({ name: 'bank', type: 'bankAccount', configs: JSON.stringify([{ key: '1', value: '1' }]) })
      .build();

    await DataSetBuilder.create()
      .withProvider({ code: 'test' })
      .withAuthority({ fullCode: 'GM' })
      .withCountry({ iso2: 'CY' })
      .withCurrency({ iso3: 'USD' })
      .withBankAccount({ name: 'bank', type: 'bankAccount', configs: JSON.stringify([{ key: '1', value: '2' }]) })
      .build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      bankAccountsData: [
        {
          parameters: {
            countryAuthorities: [{ authority: 'GM', country: 'CY' }],
            currencies: expect.arrayContaining(['EUR', 'ZAR']),
          },
          bankAccounts: [{ name: 'bank', type: 'bankAccount', configs: [{ key: '1', value: '1' }] }],
        },
        {
          parameters: {
            countryAuthorities: [{ authority: 'GM', country: 'CY' }],
            currencies: ['USD'],
          },
          bankAccounts: [{ name: 'bank', type: 'bankAccount', configs: [{ key: '1', value: '2' }] }],
        },
      ],
    });
  });
});
