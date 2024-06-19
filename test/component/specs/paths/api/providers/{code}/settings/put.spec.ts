import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { DbTable, ErrorCode, dbSelectOne } from '@internal/component-test-library';
import { ProviderType, TransactionType } from '@core';

describe('PUT /api/providers/{code}/settings', () => {
  const sendRequest = (code: string, body: object): request.Test =>
    request(baseUrl)
      .put(`api/providers/${code}/settings`)
      .withAuth()
      .send(body);

  beforeEach(async () => await cleanUp());

  it('Should throw ERR_NOT_FOUND if got unknown provider', async () => {
    const { statusCode, body } = await sendRequest('test', {
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: null,
      },
      countryAuthoritySettings: [],
    });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown Provider',
      meta: { id: '{\"code\":\"test\"}' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if got invalid format of convertedCurrency', async () => {
    const { statusCode, body } = await sendRequest('test', {
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: '',
      },
      countryAuthoritySettings: [],
    });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: { details: '[{\"message\":\"must NOT have fewer than 3 characters\",\"path\":\"/body/provider/convertedCurrency\",\"value\":null}]' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if got unknown convertedCurrency', async () => {
    await DataSetBuilder.create()
      .withProvider({ code: 'test' })
      .build();
    const { statusCode, body } = await sendRequest('test', {
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: 'XXX',
      },
      countryAuthoritySettings: [],
    });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown currency \"XXX\"',
      meta: { id: 'XXX' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if got unknown country-authority', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withProvider({ convertedCurrency: 'USD' })
      .withMethod()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
      .build();
    const payload = {
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: null,
      },
      countryAuthoritySettings: [
        { country: 'AR', authority: 'GM', settings: { isPayoutAsRefund: true, isPaymentAccountRequired: true } },
      ],
    };

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'In the request there are countries-authorities that are not mapped to the provider',
      meta: { id: 'AR:GM' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_CONFLICT if got duplicates in countryAuthoritySettings', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withProvider({ convertedCurrency: 'USD' })
      .withMethod()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
      .build();
    const payload = {
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: null,
      },
      countryAuthoritySettings: [
        { country: 'CY', authority: 'CYSEC', settings: { isPayoutAsRefund: true, isPaymentAccountRequired: true } },
        { country: 'CY', authority: 'CYSEC', settings: { isPayoutAsRefund: true, isPaymentAccountRequired: true } },
      ],
    };

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'In the request there are countries-authorities with duplicates',
      meta: { id: 'CY:CYSEC' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should update provider settings', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withProvider({ convertedCurrency: 'USD' })
      .withMethod()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
      .build();
    await DataSetBuilder.create()
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withProviderMethods({ providerId: provider.id, isPayoutAsRefund: false, isPaymentAccountRequired: false })
      .build();
    const payload = {
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: null,
      },
      countryAuthoritySettings: [
        { country: 'CY', authority: 'CYSEC', settings: { isPayoutAsRefund: false, isPaymentAccountRequired: false } },
        { country: 'AR', authority: 'GM', settings: { isPayoutAsRefund: true, isPaymentAccountRequired: true } },
      ],
    };

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: null,
      },
      countryAuthoritySettings: [
        {
          country: 'AR',
          authority: 'GM',
          settings: { isPayoutAsRefund: true, isPaymentAccountRequired: true, defaultCurrency: null },
        },
        {
          country: 'CY',
          authority: 'CYSEC',
          settings: { isPayoutAsRefund: false, isPaymentAccountRequired: false, defaultCurrency: null },
        },
      ],
    });
  });

  it('Should store and return convertedCurrency in upper case', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withProvider({ code: 'stripe', convertedCurrency: null })
      .withMethod()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
      .build();
    const payload = {
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: 'usd',
      },
      countryAuthoritySettings: [
        { country: 'CY', authority: 'CYSEC', settings: { isPayoutAsRefund: false, isPaymentAccountRequired: false } },
      ],
    };

    const { statusCode, body } = await sendRequest(provider.code, payload);
    const providerEntity = await dbSelectOne(DbTable.cpProviders, { code: 'stripe' });

    expect(statusCode).toBe(200);
    expect(providerEntity.convertedCurrency).toBe('USD');
    expect(body).toStrictEqual({
      provider: {
        type: ProviderType.DEFAULT,
        convertedCurrency: 'USD',
      },
      countryAuthoritySettings: [
        {
          country: 'CY',
          authority: 'CYSEC',
          settings: { isPayoutAsRefund: false, isPaymentAccountRequired: false, defaultCurrency: null },
        },
      ],
    });
  });

  describe('#defaultCurrency', () => {
    it('Should throw ERR_VALIDATION_REQUEST if missing mandatory parameters', async () => {
      const payload = {
        provider: {
          type: 'default',
          convertedCurrency: null,
        },
        countryAuthoritySettings: [
          {
            country: 'CY',
            authority: 'CYSEC',
            settings: {
              isPayoutAsRefund: false,
              isPaymentAccountRequired: false,
              defaultCurrency: {},
            },
          },
        ],
      };

      const { statusCode, body } = await sendRequest('code', payload);

      expect(statusCode).toBe(400);
      expect(body).toMatchObject({
        message: 'Bad Request',
        code: ErrorCode.ERR_VALIDATION_REQUEST,
        meta: {
          // eslint-disable-next-line max-len
          details: `[{"message":"must have required property 'currency'","path":"/body/countryAuthoritySettings/0/settings/defaultCurrency/currency","value":null},{"message":"must have required property 'isEnabled'","path":"/body/countryAuthoritySettings/0/settings/defaultCurrency/isEnabled","value":null},{"message":"must have required property 'methods'","path":"/body/countryAuthoritySettings/0/settings/defaultCurrency/methods","value":null}]`,
        },
      });
    });

    it('Should throw ERR_VALIDATION if unknown method', async () => {
      const { provider } = await DataSetBuilder.create()
        .withCurrency({ iso3: 'USD' })
        .withProvider({ convertedCurrency: 'USD' })
        .withMethod()
        .withCountry({ iso2: 'CY' })
        .withAuthority({ fullCode: 'CYSEC' })
        .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
        .build();

      const payload = {
        provider: {
          type: 'default',
          convertedCurrency: null,
        },
        countryAuthoritySettings: [
          {
            country: 'CY',
            authority: 'CYSEC',
            settings: {
              isPayoutAsRefund: false,
              isPaymentAccountRequired: false,
              defaultCurrency: {
                isEnabled: true,
                currency: 'USD',
                methods: ['unknown'],
              },
            },
          },
        ],
      };

      const { statusCode, body } = await sendRequest(provider.code, payload);

      expect(statusCode).toBe(422);
      expect(body).toMatchObject({
        code: 'ERR_VALIDATION',
        message: 'The unknown method isn\'t mapped to USD in CYSEC authority for CY country.',
        requestId: expect.toBeGUID(),
      });
    });

    it('Should throw ERR_VALIDATION if unknown currency', async () => {
      const { provider, method } = await DataSetBuilder.create()
        .withCurrency({ iso3: 'USD' })
        .withProvider({ convertedCurrency: 'USD' })
        .withMethod()
        .withCountry({ iso2: 'CY' })
        .withAuthority({ fullCode: 'CYSEC' })
        .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
        .withTransactionConfig({ currencyIso3: 'USD' })
        .build();

      const payload = {
        provider: {
          type: 'default',
          convertedCurrency: null,
        },
        countryAuthoritySettings: [
          {
            country: 'CY',
            authority: 'CYSEC',
            settings: {
              isPayoutAsRefund: false,
              isPaymentAccountRequired: false,
              defaultCurrency: {
                isEnabled: true,
                currency: 'TTT',
                methods: [method.code],
              },
            },
          },
        ],
      };

      const { statusCode, body } = await sendRequest(provider.code, payload);

      expect(statusCode).toBe(422);
      expect(body).toMatchObject({
        code: 'ERR_VALIDATION',
        message: `The ${method.code} method isn't mapped to TTT in CYSEC authority for CY country.`,
        requestId: expect.toBeGUID(),
      });
    });

    it('Should update settings', async () => {
      const { provider, method } = await DataSetBuilder.create()
        .withCurrency({ iso3: 'USD' })
        .withProvider({ convertedCurrency: 'USD' })
        .withMethod()
        .withCountry({ iso2: 'CY' })
        .withAuthority({ fullCode: 'CYSEC' })
        .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
        .withTransactionConfig({ currencyIso3: 'USD', type: TransactionType.DEPOSIT })
        .build();

      const payload = {
        provider: {
          type: 'default',
          convertedCurrency: 'USD',
        },
        countryAuthoritySettings: [
          {
            country: 'CY',
            authority: 'CYSEC',
            settings: {
              isPayoutAsRefund: false,
              isPaymentAccountRequired: false,
              defaultCurrency: {
                isEnabled: true,
                currency: 'USD',
                methods: [method.code],
              },
            },
          },
        ],
      };

      const { statusCode, body } = await sendRequest(provider.code, payload);

      expect(statusCode).toBe(200);
      expect(body).toStrictEqual({
        provider: {
          type: 'default',
          convertedCurrency: 'USD',
        },
        countryAuthoritySettings: [
          {
            country: 'CY',
            authority: 'CYSEC',
            settings: {
              isPayoutAsRefund: false,
              isPaymentAccountRequired: false,
              defaultCurrency: {
                currency: 'USD',
                isEnabled: true,
                methods: [method.code],
              },
            },
          },
        ],
      });
    });
  });
});
