import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp, validateMandatoryParameterResponse } from '@test-component/utils';
import { Paths } from '@typings/openapi';

describe('PATCH /api/providers/{code}', () => {
  const sendRequest = (providerCode: string, data: Partial<Paths.UpdateProvider.RequestBody> = {}): request.Test =>
    request(baseUrl)
      .patch(`api/providers/${providerCode}`)
      .withAuth()
      .send(data);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw NOT_FOUND if unknown provider', async () => {
    const { statusCode, body } = await sendRequest('unknown', { isEnabled: false });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown Provider',
      meta: { id: '{"code":"unknown"}' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if has additional properties', async () => {
    const { statusCode, body } = await sendRequest('unknown', { test: 1, isEnabled: true } as unknown as Paths.UpdateProvider.RequestBody);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: { details: '[{"message":"must NOT have additional properties","path":"/body/test","value":null}]' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if payload is empty', async () => {
    const { statusCode, body } = await sendRequest('unknown');

    validateMandatoryParameterResponse('isEnabled', 'body', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if isEnabled has invalid type', async () => {
    const { statusCode, body } = await sendRequest('unknown', { isEnabled: 'asdf' } as unknown as Paths.UpdateProvider.RequestBody);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: { details: '[{"message":"must be boolean","path":"/body/isEnabled","value":null}]' },
      requestId: expect.toBeGUID(),
    });
  });

  it.each([
    { isEnabled: true, isEnabledTarget: false },
    { isEnabled: false, isEnabledTarget: true },
  ])('Should update isEnabled from $isEnabled to $isEnabledTarget', async ({ isEnabled, isEnabledTarget }) => {
    const { provider } = await DataSetBuilder.create().withProvider({ isEnabled }).build();

    const { statusCode, body } = await sendRequest(provider.code, { isEnabled: isEnabledTarget });

    expect(statusCode).toBe(200);
    expect(Boolean(provider.isEnabled)).toEqual(isEnabled);
    expect(body).toStrictEqual({
      name: provider.name,
      code: provider.code,
      type: provider.type,
      isEnabled: isEnabledTarget,
    });
  });
});
