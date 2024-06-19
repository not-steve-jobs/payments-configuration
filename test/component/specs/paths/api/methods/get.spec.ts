import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';

describe('GET /api/methods', () => {
  const sendRequest = (): request.Test =>
    request(baseUrl)
      .get(`api/methods`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should return empty array', async () => {
    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ methods: [] });
  });

  it('Should return two methods', async () => {
    const ds1 = await DataSetBuilder.create().withMethod().build();
    const ds2 = await DataSetBuilder.create().withMethod().build();

    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      methods: expect.arrayContaining([
        { code: ds1.method.code, name: ds1.method.name, description: ds1.method.description },
        { code: ds2.method.code, name: ds2.method.name, description: ds2.method.description },
      ]),
    });
  });
});
