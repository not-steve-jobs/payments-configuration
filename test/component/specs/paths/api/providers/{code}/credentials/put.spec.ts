import casual from 'casual';
import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library';
import { NotFoundError } from '@internal/errors-library';
import { cleanUp, validateMandatoryParameterResponse } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';

describe('PUT /api/providers/{code}/credentials', () => {
  const sendRequest = (providerCode: string, payload: Record<string, unknown>): request.Test =>
    request(baseUrl)
      .put(`api/providers/${providerCode}/credentials`)
      .withAuth()
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw NotFoundError if unknown provider', async () => {
    const { statusCode, body } = await sendRequest('unknown', { credentialsData: [] });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: 'Unknown Provider',
      code: NotFoundError.code,
      meta: { id: '{"code":"unknown"}' },
    });
  });

  it('Should throw NotFoundError if unknown currency', async () => {
    const { provider } = await DataSetBuilder.create()
      .withProvider()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withMethod()
      .withProviderMethods()
      .build();
    const credentialsData = [
      {
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        credentialsDetails: [],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, { credentialsData });

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
    const credentialsData = [
      {
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'CYSEC', country: 'CY' }] },
        credentialsDetails: [],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, { credentialsData });

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'In the request there are countries-authorities that are not mapped to the provider',
      code: 'ERR_CONFLICT',
      meta: { id: 'CY:CYSEC' },
    });
  });

  it('Should throw NotFoundError if a Provider does not exist in a country', async () => {
    const { provider } = await DataSetBuilder
      .create()
      .withProvider()
      .withMethod()
      .withCurrency({ iso3: 'ILS' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withProviderMethods()
      .build();
    const credentialsData = [
      {
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'GM', country: 'AR' }] },
        credentialsDetails: [],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, { credentialsData });

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'In the request there are countries-authorities that are not mapped to the provider',
      code: 'ERR_CONFLICT',
      meta: { id: 'AR:GM' },
    });
  });

  it('Should throw NotFoundError if a Provider does not exist in a country-authority', async () => {
    const { provider } = await DataSetBuilder
      .create()
      .withProvider()
      .withMethod()
      .withCurrency({ iso3: 'ILS' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProviderMethods()
      .build();
    await DataSetBuilder
      .create()
      .withMethod()
      .withCurrency({ iso3: 'ILS' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'GM' })
      .withProviderMethods({ providerId: provider.id })
      .build();
    const credentialsData = [
      {
        parameters: { currencies: ['ILS'], countryAuthorities: [{ authority: 'GM', country: 'AR' }] },
        credentialsDetails: [],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, { credentialsData });

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'In the request there are countries-authorities that are not mapped to the provider',
      code: 'ERR_CONFLICT',
      meta: { id: 'AR:GM' },
    });
  });

  it('Should throw if there is no credentialsData', async () => {
    const { provider } = await DataSetBuilder.create().withProvider().build();

    const { statusCode, body } = await sendRequest(provider.code, {});

    validateMandatoryParameterResponse('credentialsData', 'body', statusCode, body);
  });

  it('Should throw if credentialsData object is empty', async () => {
    const credentialsData = [{ parameters: {}, credentialsDetails: [{}] }];
    const { statusCode, body } = await sendRequest('test', { credentialsData });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        // eslint-disable-next-line max-len
        details: `[{"message":"must have required property 'key'","path":"/body/credentialsData/0/credentialsDetails/0/key","value":null},{"message":"must have required property 'value'","path":"/body/credentialsData/0/credentialsDetails/0/value","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw if key length is higher than 255', async () => {
    const credentialsData = [{ parameters: {}, credentialsDetails: [{ key: 'longString'.repeat(255), value: 'test' }] }];
    const { statusCode, body } = await sendRequest('test', { credentialsData });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must NOT have more than 255 characters","path":"/body/credentialsData/0/credentialsDetails/0/key","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw if value length is higher than 2500', async () => {
    const credentialsData = [{ parameters: {}, credentialsDetails: [{ key: 'key', value: 'longString'.repeat(251) }] }];
    const { statusCode, body } = await sendRequest('test', { credentialsData });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must NOT have more than 2500 characters","path":"/body/credentialsData/0/credentialsDetails/0/value","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it.each([
    { currency: '', message: 'must NOT have fewer than 3 characters' },
    { currency: null, message: 'must be string' },
  ])('Should throw ERR_VALIDATION_REQUEST if currency is $currency', async ({ currency, message }) => {
    const credentialsData = [{
      parameters: {
        countryAuthorities: [{ country: 'CY', authority: 'CYSEC' }],
        currencies: [currency],
      },
      credentialsDetails: [{ key: 'key', value: 'value' }],
    }];
    const { statusCode, body } = await sendRequest('test', { credentialsData });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"${message}","path":"/body/credentialsData/0/parameters/currencies/0","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should return empty array if override with empty credentialsData', async () => {
    const { provider } = await DataSetBuilder.create().withProvider().build();

    const { statusCode, body } = await sendRequest(provider.code, { credentialsData: [] });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ credentialsData: [] });
  });

  it('Should update current and add new credential', async () => {
    const { provider } = await DataSetBuilder.create().withProviderMethods().withCredential({
      credentialsDetails: JSON.stringify([{ key: 'aaa', value: 'bbb' }]),
    }).build();
    const credentialsData = [
      {
        parameters: {},
        credentialsDetails: [
          { key: 'aaa', value: 'bbb' },
          { key: 'bbb', value: casual.string },
        ],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, { credentialsData });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ credentialsData });
  });

  it('Should throw ERR_CREDENTIALS_OVERLAP', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).build();
    const credentialsData = [
      {
        parameters: {},
        credentialsDetails: [
          { key: 'one', value: 'one' },
          { key: 'two', value: 'two' },
          { key: 'three', value: 'three' },
          { key: 'one', value: 'four' },
        ],
      },
    ];

    const { statusCode, body } = await sendRequest('test', { credentialsData });

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CREDENTIALS_OVERLAP',
      message: 'Duplicate credentials found: one. Please ensure unique combinations for rules and keys before updating.',
      requestId: expect.toBeGUID(),
    });
  });

  it('Should create credentials', async () => {
    const credentialsData = [
      {
        parameters: {
          countryAuthorities: [
            { authority: 'CYSEC', country: 'CY' },
            { authority: 'FSCM', country: 'GR' },
            { authority: 'GM', country: 'IL' },
          ],
          currencies: ['EUR', 'ILS', 'USD'],
        },
        credentialsDetails: [
          { key: casual.string, value: casual.string },
        ],
      },
    ];

    const { provider } = await DataSetBuilder.create().withProvider({ code: 'test' }).build();
    await DataSetBuilder.create().withCurrency({ iso3: 'NOK' }).build();
    await DataSetBuilder.create()
      .withAuthority({ fullCode: 'CYSEC' })
      .withCountry({ iso2: 'CY' })
      .withProviderMethods({ providerId: provider.id })
      .withCurrency({ iso3: 'EUR' })
      .build();
    await DataSetBuilder.create()
      .withAuthority({ fullCode: 'GM' })
      .withCountry({ iso2: 'IL' })
      .withProviderMethods({ providerId: provider.id })
      .withCurrency({ iso3: 'ILS' })
      .build();
    await DataSetBuilder.create()
      .withAuthority({ fullCode: 'FSCM' })
      .withCountry({ iso2: 'GR' })
      .withProviderMethods({ providerId: provider.id })
      .withCurrency({ iso3: 'USD' })
      .build();
    const { statusCode, body } = await sendRequest('test', { credentialsData });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ credentialsData });
  });

  it('Should update credentials', async () => {
    const credentialData = {
      parameters: {
        countryAuthorities: [
          { authority: 'CYSEC', country: 'CY' },
          { authority: 'FSCM', country: 'GR' },
          { authority: 'GM', country: 'IL' },
        ],
        currencies: ['EUR', 'ILS', 'USD'],
      },
      credentialsDetails: [
        { key: 'one', value: 'one' },
      ],
    };

    { // Create credentials
      const { provider } = await DataSetBuilder.create().withProvider({ code: 'test' }).build();
      await DataSetBuilder.create().withCurrency({ iso3: 'NOK' }).build();
      await DataSetBuilder.create()
        .withAuthority({ fullCode: 'CYSEC' })
        .withCountry({ iso2: 'CY' })
        .withProviderMethods({ providerId: provider.id })
        .withCurrency({ iso3: 'EUR' })
        .build();
      await DataSetBuilder.create()
        .withAuthority({ fullCode: 'GM' })
        .withCountry({ iso2: 'IL' })
        .withProviderMethods({ providerId: provider.id })
        .withCurrency({ iso3: 'ILS' })
        .build();
      await DataSetBuilder.create()
        .withAuthority({ fullCode: 'FSCM' })
        .withCountry({ iso2: 'GR' })
        .withProviderMethods({ providerId: provider.id })
        .withCurrency({ iso3: 'USD' })
        .build();
      const { statusCode, body } = await sendRequest('test', { credentialsData: [credentialData] });

      expect(statusCode).toBe(200);
      expect(body).toStrictEqual({ credentialsData: [credentialData] });
    }

    { // Update credentials
      credentialData.credentialsDetails.push({ key: 'two', value: 'two' });
      credentialData.parameters.currencies.push('NOK');

      const { statusCode, body } = await sendRequest('test', { credentialsData: [credentialData] });

      expect(statusCode).toBe(200);
      expect(body).toStrictEqual({
        credentialsData: [
          {
            parameters: {
              countryAuthorities: [
                { authority: 'CYSEC', country: 'CY' },
                { authority: 'FSCM', country: 'GR' },
                { authority: 'GM', country: 'IL' },
              ],
              currencies: ['EUR', 'ILS', 'NOK', 'USD'],
            },
            credentialsDetails: credentialData.credentialsDetails,
          },
        ],
      });
    }
  });
});
