import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

describe('GET /api/currencies', () => {
  const sendRequest = (): request.Test =>
    request(baseUrl)
      .get(`api/currencies`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should return currency list', async () => {
    const [{ currency: currencyOne }, { currency: currencyTwo }] = await Promise.all([
      DataSetBuilder.create().withCurrency().build(),
      DataSetBuilder.create().withCurrency().build(),
    ]);

    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toEqual(expect.arrayContaining([
      currencyOne.iso3,
      currencyTwo.iso3,
    ]));
  });
});
