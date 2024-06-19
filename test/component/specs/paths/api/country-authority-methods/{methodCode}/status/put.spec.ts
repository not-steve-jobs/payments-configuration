import casual from 'casual';
import request from 'supertest';

import { Authority } from '@core';
import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { generateCommonAuthorityAndCountryQueryParameters, generateMethodCode } from '@test-component/data';
import { CommonMandatoryQueryParameters } from '@test-component/constant';
import {
  cleanUp,
  validateInvalidCountryLengthResponse,
  validateMandatoryParameterResponse,
} from '@test-component/utils';

describe('PUT /api/country-authority-methods/{methodCode}/status', () => {
  const sendRequest = (methodCode: unknown, query: Record<string, unknown>, payload: Record<string, unknown>): request.Test =>
    request(baseUrl)
      .put(`api/country-authority-methods/${methodCode}/status`)
      .withAuth()
      .query(query)
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(CommonMandatoryQueryParameters)(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s`, async field => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters();
    delete query[field];

    const { statusCode, body } = await sendRequest(methodCode, query, { isEnabled: true });

    validateMandatoryParameterResponse(field, 'query', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if country longer than 2 symbols', async () => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: 'test' });

    const { statusCode, body } = await sendRequest(methodCode, query, { isEnabled: true });

    validateInvalidCountryLengthResponse(statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if method code is larger than 50', async () => {
    const methodCode = 'x'.repeat(51);
    const query = generateCommonAuthorityAndCountryQueryParameters();

    const { statusCode, body } = await sendRequest(methodCode, query, { isEnabled: true });

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


  it('Should throw ERR_NOT_FOUND if there is no mapping between country and authority', async () => {
    const methodCode = generateMethodCode();
    const authority = Authority.CBB;
    const country = casual.country_code;
    const query = generateCommonAuthorityAndCountryQueryParameters({ authority, country });

    const { statusCode, body } = await sendRequest(methodCode, query, { isEnabled: false });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: `Country's authority not found`,
      meta: {
        id: `${country}:${authority}`,
      },
      requestId: expect.toBeGUID(),
    });
  });
});
