import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import {
  DataSetBuilder,
  generateChangeProviderMethodPayload,
  generateCommonAuthorityAndCountryQueryParameters,
  generateMethodCode,
} from '@test-component/data';
import { ChangeProviderMethodParameter, CommonMandatoryQueryParameters } from '@test-component/constant';
import {
  cleanUp,
  validateInvalidCountryLengthResponse,
  validateMandatoryParameterResponse,
} from '@test-component/utils';
import { CpTables, TransactionType } from '@core';

async function getDefaultCurrency(providerMethodId: string): Promise<string | null> {
  const [{ defaultCurrency }] =  await global
    .knexSession(`${CpTables.CP_PROVIDER_METHODS}`)
    .select(`defaultCurrency`)
    .where(`id`, providerMethodId);

  const currencyDto = JSON.parse(defaultCurrency);

  return currencyDto ? currencyDto.currency : null;
}

describe('PUT /api/country-authority-methods/{methodCode}/providers', () => {
  const sendRequest = (methodCode: unknown, query: Record<string, unknown>, payload: object): request.Test =>
    request(baseUrl)
      .put(`api/country-authority-methods/${methodCode}/providers`)
      .withAuth()
      .query(query)
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(CommonMandatoryQueryParameters)(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory query field %s`, async field => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters();
    delete query[field];

    const { statusCode, body } = await sendRequest(methodCode, query, []);

    validateMandatoryParameterResponse(field, 'query', statusCode, body);
  });

  it.each(Object.values(ChangeProviderMethodParameter))(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory body field %s`, async field => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters();
    const payload = generateChangeProviderMethodPayload();
    delete payload[field];

    const { statusCode, body } = await sendRequest(methodCode, query, [payload]);

    validateMandatoryParameterResponse(field, 'body/0', statusCode, body);
  });

  it.each([
    { currency: 'DDDD', message: 'must NOT have more than 3 characters' },
    { currency: 'D', message: 'must NOT have fewer than 3 characters' },
  ])('Should throw ERR_VALIDATION_REQUEST if currency has invalid length $currency', async ({ currency, message }) => {
    const query = generateCommonAuthorityAndCountryQueryParameters();
    const payload = generateChangeProviderMethodPayload({
      currencySettings: [
        {
          currency,
          deposit: {
            minAmount: 0,
            maxAmount: 0,
            isEnabled: true,
          },
          refund: {
            period: 5,
            isEnabled: true,
            minAmount: 0,
          },
        },
      ],
    });
    const { statusCode, body } = await sendRequest('test', query, [payload]);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"${message}","path":"/body/0/currencySettings/0/currency","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if payload is not array', async () => {
    const methodCode = generateMethodCode();
    const payload = generateCommonAuthorityAndCountryQueryParameters();

    const { statusCode, body } = await sendRequest(methodCode, payload, {});

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must be array","path":"/body","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if period is larger than 3650', async () => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters();
    const payload = generateChangeProviderMethodPayload({
      currencySettings: [
        {
          currency: 'USD',
          deposit: {
            minAmount: 0,
            maxAmount: 0,
            isEnabled: true,
          },
          refund: {
            period: 2147483647,
            isEnabled: true,
            minAmount: 0,
          },
        },
      ],
    });

    const { statusCode, body } = await sendRequest(methodCode, query, [payload]);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must be <= 3650","path":"/body/0/currencySettings/0/refund/period","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if method code is larger than 50', async () => {
    const methodCode = 'x'.repeat(51);
    const query = generateCommonAuthorityAndCountryQueryParameters();
    const payload = generateChangeProviderMethodPayload();

    const { statusCode, body } = await sendRequest(methodCode, query, [payload]);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must NOT have more than 50 characters","path":"/params/methodCode","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if country longer than 2 symbols', async () => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: 'test' });

    const { statusCode, body } = await sendRequest(methodCode, query, []);

    validateInvalidCountryLengthResponse(statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if there is no mapping between authority and country', async () => {
    const methodCode = generateMethodCode();
    const country = 'TT';
    const query = generateCommonAuthorityAndCountryQueryParameters({ country });

    const { statusCode, body } = await sendRequest(methodCode, query, []);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Country\'s authority not found',
      meta: {
        id: `${country}:${query.authority}`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if payment method is unknown', async () => {
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withProviderMethods()
      .build();
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
    });

    const { statusCode, body } = await sendRequest(methodCode, query, []);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Payment Method not found',
      meta: {
        id: `${countryAuthority.id}:${methodCode}`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if payload has unknown payment method', async () => {
    const { countryAuthority, method, countryAuthorityMethod } = await DataSetBuilder
      .create()
      .withProviderMethods()
      .build();
    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
    });
    const payload = generateChangeProviderMethodPayload();

    const { statusCode, body } = await sendRequest(method.code, query, [payload]);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Provider method not found',
      meta: {
        id: `${countryAuthorityMethod.id}:${payload.providerCode}`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should delete transactionConfigs if currencySetting is empty', async () => {
    const { countryAuthority, provider, method } = await DataSetBuilder
      .create()
      .withConfigs()
      .withProviderMethod({ isEnabled: true })
      .build();

    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
    });
    const payload = generateChangeProviderMethodPayload({
      providerCode: provider.code,
      currencySettings: [],
    });

    const { statusCode, body } = await sendRequest(method.code, query, [payload]);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        providerCode: provider.code,
        providerName: provider.name,
        isEnabled: true,
        currencySettings: [],
      },
    ]);
  });

  it.each([
    { isEnabled: false, isEnabledNew: true },
    { isEnabled: true, isEnabledNew: false },
  ])('Should change providerMethod isEnabled $isEnabled -> $isEnabledNew', async ({ isEnabled, isEnabledNew }) => {
    const { countryAuthority, provider, method, providerMethod } = await DataSetBuilder
      .create()
      .withConfigs()
      .withProviderMethod({ isEnabled })
      .build();

    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: countryAuthority.countryIso2,
      authority: countryAuthority.authorityFullCode,
    });
    const payload = generateChangeProviderMethodPayload({
      providerCode: provider.code,
      currencySettings: [],
      isEnabled: isEnabledNew,
    });
    const { statusCode, body } = await sendRequest(method.code, query, [payload]);

    expect(statusCode).toBe(200);
    expect(Boolean(providerMethod.isEnabled)).toBe(isEnabled);
    expect(body).toStrictEqual([
      {
        providerCode: provider.code,
        providerName: provider.name,
        isEnabled: isEnabledNew,
        currencySettings: [],
      },
    ]);
  });

  it('Should create configs for several currencies', async () => {
    const ds1 = await DataSetBuilder.create().withConfigs({ currencyIso3: 'USD' }).withCurrency({ iso3: 'USD' }).build();
    await DataSetBuilder.create().withCountryAuthorityMethod({
      countryAuthorityId: ds1.countryAuthority.id,
      methodId: ds1.method.id,
    }).withCurrency({ iso3: 'EUR' }).build();
    await DataSetBuilder.create().withCountryAuthorityMethod({
      countryAuthorityId: ds1.countryAuthority.id,
      methodId: ds1.method.id,
    }).withCurrency({ iso3: 'ILS' }).build();

    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: ds1.countryAuthority.countryIso2,
      authority: ds1.countryAuthority.authorityFullCode,
    });
    const payload = generateChangeProviderMethodPayload({
      providerCode: ds1.provider.code,
      currencySettings: [
        {
          currency: 'USD',
          deposit: {
            isEnabled: true,
            maxAmount: 5000,
            minAmount: 4999,
          },
          refund: {
            isEnabled: true,
            minAmount: 100,
            period: 0,
          },
          payout: {
            isEnabled: false,
            maxAmount: 3000,
            minAmount: 2000,
          },
        },
        {
          currency: 'EUR',
          deposit: {
            isEnabled: true,
            maxAmount: 7000,
            minAmount: 2000,
          },
          refund: {
            isEnabled: true,
            minAmount: 101,
            period: 2,
          },
          payout: {
            isEnabled: false,
            maxAmount: 3002,
            minAmount: 2002,
          },
        },
        {
          currency: 'ILS',
          deposit: {
            isEnabled: true,
            maxAmount: 6000,
            minAmount: 1999,
          },
          refund: {
            isEnabled: true,
            minAmount: 102,
            period: 1,
          },
          payout: {
            isEnabled: false,
            maxAmount: 3001,
            minAmount: 2001,
          },
        },
      ],
      isEnabled: true,
    });
    const { statusCode, body } = await sendRequest(ds1.method.code, query, [payload]);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].providerCode).toBe(ds1.provider.code);
    expect(body[0].providerName).toBe(ds1.provider.name);
    expect(body[0].isEnabled).toBe(true);
    expect(body[0].currencySettings).toEqual(expect.arrayContaining([
      expect.objectContaining(payload.currencySettings[0]),
      expect.objectContaining(payload.currencySettings[1]),
      expect.objectContaining(payload.currencySettings[2]),
    ]));
  });

  it('Should updates specific configs and deletes unsent ones', async () => {
    const ds1 = await DataSetBuilder.create().withConfigs({ currencyIso3: 'USD' }).withCurrency({ iso3: 'USD' }).build();
    await DataSetBuilder.create().withCountryAuthorityMethod({
      countryAuthorityId: ds1.countryAuthority.id,
      methodId: ds1.method.id,
    }).withCurrency({ iso3: 'EUR' }).build();
    await DataSetBuilder.create().withCountryAuthorityMethod({
      countryAuthorityId: ds1.countryAuthority.id,
      methodId: ds1.method.id,
    }).withCurrency({ iso3: 'ILS' }).build();

    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: ds1.countryAuthority.countryIso2,
      authority: ds1.countryAuthority.authorityFullCode,
    });
    const payloadToSeed = generateChangeProviderMethodPayload({
      providerCode: ds1.provider.code,
      currencySettings: [
        {
          currency: 'USD',
          deposit: {
            isEnabled: true,
            maxAmount: 5000,
            minAmount: 4999,
          },
          refund: {
            isEnabled: true,
            minAmount: 100,
            period: 0,
          },
          payout: {
            isEnabled: false,
            maxAmount: 3000,
            minAmount: 2000,
          },
        },
        {
          currency: 'EUR',
          deposit: {
            isEnabled: true,
            maxAmount: 7000,
            minAmount: 2000,
          },
          refund: {
            isEnabled: true,
            minAmount: 101,
            period: 2,
          },
          payout: {
            isEnabled: false,
            maxAmount: 3002,
            minAmount: 2002,
          },
        },
        {
          currency: 'ILS',
          deposit: {
            isEnabled: true,
            maxAmount: 6000,
            minAmount: 1999,
          },
          refund: {
            isEnabled: true,
            minAmount: 102,
            period: 1,
          },
          payout: {
            isEnabled: false,
            maxAmount: 3001,
            minAmount: 2001,
          },
        },
      ],
      isEnabled: true,
    });
    { // Create configs in three currencies
      const { statusCode, body } = await sendRequest(ds1.method.code, query, [payloadToSeed]);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
      expect(body[0].providerCode).toBe(ds1.provider.code);
      expect(body[0].providerName).toBe(ds1.provider.name);
      expect(body[0].isEnabled).toBe(true);
      expect(body[0].currencySettings).toHaveLength(3);
      expect(body[0].currencySettings).toStrictEqual(expect.arrayContaining([
        expect.objectContaining(payloadToSeed.currencySettings[0]),
        expect.objectContaining(payloadToSeed.currencySettings[1]),
        expect.objectContaining(payloadToSeed.currencySettings[2]),
      ]));
    }

    { // Update configs with only one currency
      const payload = { providerCode: payloadToSeed.providerCode, isEnabled: payloadToSeed.isEnabled, currencySettings: [payloadToSeed.currencySettings[0]]  };
      payload.currencySettings[0].deposit.maxAmount = 8888;

      const { statusCode, body } = await sendRequest(ds1.method.code, query, [payload]);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
      expect(body[0].providerCode).toBe(ds1.provider.code);
      expect(body[0].providerName).toBe(ds1.provider.name);
      expect(body[0].isEnabled).toBe(true);
      expect(body[0].currencySettings).toHaveLength(1);
      expect(body[0].currencySettings).toStrictEqual(expect.arrayContaining([
        expect.objectContaining(payload.currencySettings[0]),
      ]));
    }
  });

  it('Should reset defaultCurrency if there is no reference after update', async () => {
    const ds = await DataSetBuilder.create().withCurrency({ iso3: 'USD' }).withConfigs({ type: TransactionType.DEPOSIT }).withProviderMethod({
      defaultCurrency: JSON.stringify({ currency: 'USD', isEnabled: true }),
    }).build();
    await DataSetBuilder.create().withCurrency({ iso3: 'EUR' }).withTransactionConfig({
      providerMethodId: ds.providerMethod.id, currencyIso3: 'EUR', type: TransactionType.DEPOSIT,
    }).build();

    const query = generateCommonAuthorityAndCountryQueryParameters({
      country: ds.countryAuthority.countryIso2,
      authority: ds.countryAuthority.authorityFullCode,
    });
    const payload = generateChangeProviderMethodPayload({
      providerCode: ds.provider.code,
      currencySettings: [
        {
          currency: 'EUR',
          deposit: {
            isEnabled: true,
            maxAmount: 7000,
            minAmount: 2000,
          },
          refund: {
            isEnabled: true,
            minAmount: 101,
            period: 2,
          },
          payout: {
            isEnabled: false,
            maxAmount: 3002,
            minAmount: 2002,
          },
        },
      ],
      isEnabled: true,
    });

    const defaultCurrencyBefore = await getDefaultCurrency(ds.providerMethod.id);
    const { statusCode, body } = await sendRequest(ds.method.code, query, [payload]);
    const defaultCurrencyAfter = await getDefaultCurrency(ds.providerMethod.id);

    expect(statusCode).toBe(200);
    expect(defaultCurrencyBefore).toBe('USD');
    expect(defaultCurrencyAfter).toBeNull();
    expect(body[0].providerCode).toBe(ds.provider.code);
    expect(body[0].providerName).toBe(ds.provider.name);
    expect(body[0].isEnabled).toBe(true);
    expect(body[0].currencySettings).toEqual([payload.currencySettings[0]]);
  });
});
