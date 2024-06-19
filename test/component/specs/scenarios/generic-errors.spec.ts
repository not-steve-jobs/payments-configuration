import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library';

describe('GenericErrors', () => {
  it('Should throw Unexpected token if JSON is invalid', async () => {
    const invalidJSON = '[{"providerCode":"stripe","isEnabled":}]';

    const { statusCode, body } = await request(baseUrl)
      .put(`api/methods/test/providers`)
      .set(`Content-Type`, 'application/json')
      .withAuth()
      .send(invalidJSON);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      message: expect.stringContaining('Unexpected token'),
      code: ErrorCode.ERR_GENERIC,
    });
  });
});
