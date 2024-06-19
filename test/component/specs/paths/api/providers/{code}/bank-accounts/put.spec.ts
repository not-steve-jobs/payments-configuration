import request from 'supertest';

import { NotFoundError } from '@internal/errors-library';
import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { ErrorCode } from '@internal/component-test-library';

describe('PUT /api/providers/{code}/bank-accounts', () => {
  const sendRequest = (providerCode: string, payload: Record<string, unknown>): request.Test =>
    request(baseUrl)
      .put(`api/providers/${providerCode}/bank-accounts`)
      .withAuth()
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw NotFoundError if unknown provider', async () => {
    const { statusCode, body } = await sendRequest('unknown', { bankAccountsData: [] });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: 'Unknown Provider',
      code: NotFoundError.code,
      meta: { id: '{"code":"unknown"}' },
    });
  });

  it('Should throw NotFoundError if unknown currency', async () => {
    const { provider } = await DataSetBuilder.create().withProvider().build();

    const { statusCode, body } = await sendRequest(provider.code, {
      bankAccountsData: [{
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
      }],
    });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: 'Unknown currency',
      code: NotFoundError.code,
      meta: { id: { iso3: 'ILS' } },
    });
  });

  it('Should throw NotFoundError if Provider does not exist in an authority', async () => {
    const { provider } = await DataSetBuilder
      .create()
      .withProvider()
      .withMethod()
      .withCurrency({ iso3: 'ILS' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withProviderMethods()
      .build();

    const { statusCode, body } = await sendRequest(provider.code, {
      bankAccountsData: [{
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
      }],
    });

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'In the request there are countries-authorities that are not mapped to the provider',
      code: 'ERR_CONFLICT',
      meta: { id: 'CY:CYSEC' },
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if there is no bankAccounts', async () => {
    const { provider } = await DataSetBuilder
      .create()
      .withProvider()
      .build();

    const { statusCode, body } = await sendRequest(provider.code, {
      bankAccountsData: [{
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        bankAccounts: [],
      }],
    });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: 'ERR_VALIDATION_REQUEST',
      message: 'Bad Request',
      meta: { details: '[{"message":"must NOT have fewer than 1 items","path":"/body/bankAccountsData/0/bankAccounts","value":null}]' },
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if there is no bankAccounts configs', async () => {
    const { provider } = await DataSetBuilder
      .create()
      .withProvider()
      .build();

    const { statusCode, body } = await sendRequest(provider.code, {
      bankAccountsData: [{
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [] }],
      }],
    });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      message: 'Bad Request',
      code: 'ERR_VALIDATION_REQUEST',
      meta: {
        details: '[{\"message\":\"must NOT have fewer than 1 items\",\"path\":\"/body/bankAccountsData/0/bankAccounts/0/configs\",\"value\":null}]',
      },
    });
  });

  it('Should throw if name length is higher than 100', async () => {
    const payload = {
      bankAccountsData: [{
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        bankAccounts: [{ name: 'longString'.repeat(100), type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
      }],
    };
    const { statusCode, body } = await sendRequest('test', payload);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must NOT have more than 100 characters","path":"/body/bankAccountsData/0/bankAccounts/0/name","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw if type length is higher than 50', async () => {
    const payload = {
      bankAccountsData: [{
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        bankAccounts: [{ name: 'bank', type: 'longString'.repeat(50), configs: [{ key: 'key', value: 'value' }] }],
      }],
    };
    const { statusCode, body } = await sendRequest('test', payload);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must NOT have more than 50 characters","path":"/body/bankAccountsData/0/bankAccounts/0/type","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should update bank accounts when country is null', async () => {
    const authorityFullCode = 'GM', countryIso2 = 'CY', currencyIso3 = 'EUR', providerCode = 'test';
    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority({ fullCode: authorityFullCode })
      .withCountry({ iso2: countryIso2 })
      .withCurrency({ iso3: currencyIso3 })
      .withProviderMethods()
      .build();
    await DataSetBuilder.create()
      .withProvider( { code: providerCode })
      .withAuthority()
      .withCountry()
      .withCurrency()
      .withBankAccount()
      .build();

    const payload = {
      bankAccountsData: [{
        parameters: {
          countryAuthorities: [{ authority: authorityFullCode, country: null }],
          currencies: [currencyIso3],
        },
        bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
      }],
    };

    const { statusCode, body } = await sendRequest(providerCode, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
  });

  it('Should update bank accounts when country is empty', async () => {
    const authorityFullCode = 'GM', countryIso2 = 'CY', currencyIso3 = 'EUR', providerCode = 'test';
    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority({ fullCode: authorityFullCode })
      .withCountry({ iso2: countryIso2 })
      .withCurrency({ iso3: currencyIso3 })
      .withProviderMethods()
      .build();

    await DataSetBuilder.create()
      .withProvider( { code: providerCode })
      .withAuthority()
      .withCountry()
      .withCurrency()
      .withBankAccount()
      .build();

    const payload = {
      bankAccountsData: [{
        parameters: {
          countryAuthorities: [{ authority: authorityFullCode, country: '' }],
          currencies: [currencyIso3],
        },
        bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
      }],
    };

    const { statusCode, body } = await sendRequest(providerCode, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      bankAccountsData: [{
        parameters: {
          countryAuthorities: [{ authority: authorityFullCode, country: null }],
          currencies: [currencyIso3],
        },
        bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
      }],
    });
  });

  it('Should update bank accounts', async () => {
    const authorityFullCode = 'GM', countryIso2 = 'CY', currencyIso3 = 'EUR', providerCode = 'test';
    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority({ fullCode: authorityFullCode })
      .withCountry({ iso2: countryIso2 })
      .withCurrency({ iso3: currencyIso3 })
      .withProviderMethods()
      .build();
    await DataSetBuilder.create()
      .withProvider( { code: providerCode })
      .withAuthority()
      .withCountry()
      .withCurrency()
      .withBankAccount()
      .build();
    const payload = {
      bankAccountsData: [{
        parameters: {
          countryAuthorities: [{ authority: authorityFullCode, country: countryIso2 }],
          currencies: [currencyIso3],
        },
        bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
      }],
    };

    const { statusCode, body } = await sendRequest(providerCode, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
  });

  it('Should update bank accounts with different currencies for same authority-country combination', async () => {
    const authorityFullCode = 'GM', countryIso2 = 'CY', currencies = ['EUR', 'ZAR', 'USD'], providerCode = 'test';
    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority({ fullCode: authorityFullCode })
      .withCountry({ iso2: countryIso2 })
      .withCurrency({ iso3: currencies.at(0) })
      .withProviderMethods()
      .build();

    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority()
      .withCountry()
      .withCurrency({ iso3: currencies.at(1) })
      .withProviderMethods()
      .build();

    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority()
      .withCountry()
      .withCurrency({ iso3: currencies.at(2) })
      .withProviderMethods()
      .build();

    const payload = {
      bankAccountsData: [
        {
          parameters: {
            countryAuthorities: [{ authority: authorityFullCode, country: countryIso2 }],
            currencies: [currencies.at(0), currencies.at(1)],
          },
          bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: '1' }] }],
        },
        {
          parameters: {
            countryAuthorities: [{ authority: authorityFullCode, country: countryIso2 }],
            currencies: [currencies.at(2)],
          },
          bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: '2' }, { key: 'key', value: '1' }] }],
        },
      ],
    };


    const { statusCode, body } = await sendRequest(providerCode, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
  });

  it('Should throw ConflictError for duplicate country-authority-currency combinations', async () => {
    const authorityFullCode = 'CYSEC', countryIso2 = 'AF', providerCode = 'test';
    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority({ fullCode: authorityFullCode })
      .withCountry({ iso2: countryIso2 })
      .withCurrency({ iso3: 'EUR' })
      .withProviderMethods()
      .build();

    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority({ fullCode: authorityFullCode })
      .withCountry({ iso2: countryIso2 })
      .withCurrency({ iso3: 'EUR' })
      .withProviderMethods()
      .build();

    await DataSetBuilder.create()
      .withProvider({ code: providerCode })
      .withAuthority({ fullCode: authorityFullCode })
      .withCountry({ iso2: countryIso2 })
      .withCurrency({ iso3: 'AMD' })
      .withProviderMethods()
      .build();


    const payload = {
      bankAccountsData: [
        {
          parameters: {
            countryAuthorities: [{ authority: authorityFullCode, country: countryIso2 }],
            currencies: ['EUR', 'AMD'],
          },
          bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value' }] }],
        },
        {
          parameters: {
            countryAuthorities: [{ authority: authorityFullCode, country: countryIso2 }],
            currencies: ['EUR'],
          },
          bankAccounts: [ { name: 'bank', type: 'bankAccount', configs: [{ key: 'key', value: 'value2' }] }],
        },
      ],
    };

    const { statusCode, body } = await sendRequest(providerCode, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'Duplicate rules detected for: CYSEC:AF:EUR. Please ensure unique combinations for rules before updating',
      code: 'ERR_CONFLICT',
      meta: { id: 'CYSEC:AF:EUR' },
    });
  });

});
