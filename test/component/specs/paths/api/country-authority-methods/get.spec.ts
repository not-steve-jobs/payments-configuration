import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library';
import { CommonMandatoryQueryParameters } from '@test-component/constant';
import { DataSetBuilder, generateCommonAuthorityAndCountryQueryParameters } from '@test-component/data';
import {
  cleanUp,
  validateInvalidCountryLengthResponse,
  validateMandatoryParameterResponse,
} from '@test-component/utils';

describe('GET /api/country-authority-methods', () => {
  const sendRequest = (query: Record<string, unknown>): request.Test =>
    request(baseUrl)
      .get(`api/country-authority-methods`)
      .withAuth()
      .query(query);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(CommonMandatoryQueryParameters)(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s`, async field => {
    const query = generateCommonAuthorityAndCountryQueryParameters();
    delete query[field];

    const { statusCode, body } = await sendRequest(query);

    validateMandatoryParameterResponse(field, 'query', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if country longer than 2 symbols', async () => {
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: 'test' });

    const { statusCode, body } = await sendRequest(query);

    validateInvalidCountryLengthResponse(statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if there is no mapping between authority and country', async () => {
    const country = 'TT';
    const query = generateCommonAuthorityAndCountryQueryParameters({ country });

    const { statusCode, body } = await sendRequest(query);

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

  it('Should return empty paymentMethodConfigs for authority', async () => {
    const { countryAuthority } = await DataSetBuilder.create().withCA().build();

    const query = generateCommonAuthorityAndCountryQueryParameters({ authority: countryAuthority.authorityFullCode, country: countryAuthority.countryIso2 });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body.paymentMethodConfigs).toHaveLength(0);
  });

  it('Should return paymentMethodConfigs', async () => {
    const { provider, countryAuthority, method, countryAuthorityMethod } = await DataSetBuilder.create().withProviderMethods().build();

    const query = generateCommonAuthorityAndCountryQueryParameters({ authority: countryAuthority.authorityFullCode, country: countryAuthority.countryIso2 });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      paymentMethodConfigs: [
        {
          methodCode: method.code,
          methodName: method.name,
          isEnabled: Boolean(countryAuthorityMethod.isEnabled),
          providers: [provider.name],
        },
      ],
    });
  });

  it('Should return paymentMethodConfigs by deposits order', async () => {
    const { provider, countryAuthority, method, countryAuthorityMethod } = await DataSetBuilder.create()
      .withProviderMethods()
      .withMethod({ name: 'AAA', code: 'test1' })
      .build();
    const [pm1, pm2] = await Promise.all([
      DataSetBuilder.create()
        .withMethod({ name: 'CCC', code: 'test2' })
        .withCountryAuthorityMethod({ countryAuthorityId: countryAuthority.id, depositsOrder: 2 })
        .build(),
      DataSetBuilder.create()
        .withMethod({ name: 'BBB', code: 'test3' })
        .withCountryAuthorityMethod({ countryAuthorityId: countryAuthority.id, depositsOrder: 1 })
        .build(),
    ]);

    const query = generateCommonAuthorityAndCountryQueryParameters({
      authority: countryAuthority.authorityFullCode,
      country: countryAuthority.countryIso2,
    });

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      paymentMethodConfigs: [
        {
          methodCode: pm2.method.code,
          methodName: pm2.method.name,
          isEnabled: Boolean(pm2.countryAuthorityMethod.isEnabled),
          providers: [],
        },
        {
          methodCode: pm1.method.code,
          methodName: pm1.method.name,
          isEnabled: Boolean(pm1.countryAuthorityMethod.isEnabled),
          providers: [],
        },
        {
          methodCode: method.code,
          methodName: method.name,
          isEnabled: Boolean(countryAuthorityMethod.isEnabled),
          providers: [provider.name],
        },
      ],
    });
  });
});
