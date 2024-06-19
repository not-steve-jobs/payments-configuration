import request from 'supertest';

import * as validators from '@test-component/utils/validators';
import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { cleanUp } from '@test-component/utils';
import { generateMethodDto } from '@test-component/data';
import { Components } from '@typings/openapi';

describe('GET /api/methods', () => {
  const sendRequest = (methodDto: Components.Schemas.MethodDto): request.Test =>
    request(baseUrl)
      .put(`api/methods`)
      .withAuth()
      .send(methodDto);

  beforeEach(async () => {
    await cleanUp();
  });

  it
    .each(['code', 'description', 'name'] as (keyof Components.Schemas.MethodDto)[])
    ('Should throw ERR_VALIDATION_REQUEST if there is no required param: %s', async param => {
      const methodDto = generateMethodDto();
      delete methodDto[param];

      const { statusCode, body } = await sendRequest(methodDto);

      validators.validateMandatoryParameterResponse(param, 'body', statusCode, body);
    });

  it.each([
    '',
    'abc-def',
    '123456789012345678901234567890123456789012345678901',
    'word with space',
    'special@characters',
  ])(`Should throw ERR_VALIDATION_REQUEST if code is %s`, async code => {
    const methodDto = generateMethodDto({ code });

    const { statusCode, body } = await sendRequest(methodDto);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      message: 'Bad Request',
      code: ErrorCode.ERR_VALIDATION_REQUEST,
    });
  });

  it.each([
    '',
    '123456789012345678901234567890123456789012345678901123456789012345678901234567890123456789012345678901',
  ])(`Should throw ERR_VALIDATION_REQUEST if name is %s`, async name => {
    const methodDto = generateMethodDto({ name });

    const { statusCode, body } = await sendRequest(methodDto);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      message: 'Bad Request',
      code: ErrorCode.ERR_VALIDATION_REQUEST,
    });
  });

  it('Should create method', async () => {
    const methodDto = generateMethodDto();

    const { statusCode, body } = await sendRequest(methodDto);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(methodDto);
  });
});
