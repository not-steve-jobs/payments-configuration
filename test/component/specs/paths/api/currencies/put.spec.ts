import request from 'supertest';

import * as validators from '@test-component/utils/validators';
import { ErrorCode } from '@internal/component-test-library';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

describe('PUT /api/currencies', () => {
  const sendRequest = (currency: { iso3?: string } = {}): request.Test =>
    request(baseUrl)
      .put(`api/currencies`)
      .withAuth()
      .send(currency);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw ERR_VALIDATION_REQUEST when mandatory parameters are missing in the request body', async () => {
    const { statusCode, body } = await sendRequest();

    validators.validateMandatoryParameterResponse('iso3', 'body', statusCode, body);
  });

  it.each([
    { iso3: '', message: 'must NOT have fewer than 3 characters' },
    { iso3: 'TT', message: 'must NOT have fewer than 3 characters' },
    { iso3: 'TTt', message: `must match pattern \\\"^[A-Z]+$\\\"` },
    { iso3: null, message: 'must be string' },
    { iso3: 12345, message: 'must be string' },
  ])('Should throw $message if iso3 is $iso3', async ({ iso3, message }) => {
    const { statusCode, body } = await sendRequest({ iso3 } as { iso3: string });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      message: 'Bad Request',
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      meta: { details: expect.stringContaining(message) },
    });
  });

  it('Should throw ERR_CONFLICT if currency already exist', async () => {
    await DataSetBuilder.create().withCurrency({ iso3: 'TTT' }).build();

    const { statusCode, body } = await sendRequest({ iso3: 'TTT' });

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'Currency already exist',
      code: 'ERR_CONFLICT',
      meta: { id: 'TTT' },
    });
  });

  it('Should create new currency and return 200', async () => {
    const { statusCode, body } = await sendRequest({ iso3: 'TTT' });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ iso3: 'TTT' });
  });
});
