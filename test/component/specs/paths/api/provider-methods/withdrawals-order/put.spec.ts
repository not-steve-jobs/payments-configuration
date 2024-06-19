import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';

describe('PUT /api/provider-methods/withdrawals-order', () => {
  const sendRequest = (query: Record<string, string>, payload: object): request.Test =>
    request(baseUrl)
      .put(`api/provider-methods/withdrawals-order`)
      .withAuth()
      .query(query)
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw an error for non existing country-authority', async () => {
    const query: Record<string, string> = { authority: 'GM', country: 'AU' };

    const { statusCode, body } = await sendRequest(query, { payouts: [], refunds: [] });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: "Country's authority not found",
      code: 'ERR_NOT_FOUND',
      meta: { id: 'AU:GM' },
    });
  });

  it('Should update and return ordered withdrawals types', async () => {
    const query: Record<string, string> = { authority: 'GM', country: 'AU' };

    const set1 = await DataSetBuilder.create()
      .withCountry({ iso2: query.country })
      .withAuthority({ fullCode: query.authority })
      .withCountriesAuthorities({ countryIso2: query.country, authorityFullCode:query.authority })
      .withProviderMethods({ refundsOrder: 1, payoutsOrder: 2, isEnabled: true })
      .build();
    const set2 = await DataSetBuilder.create()
      .withCountry({ ...set1.country })
      .withAuthority({ ...set1.authority })
      .withCountriesAuthorities({ ...set1.countryAuthority })
      .withProviderMethods({ refundsOrder: 2, payoutsOrder: 1, isEnabled: true })
      .build();

    const { provider: p1, method: m1 } = set1;
    const { provider: p2, method: m2 } = set2;

    const payload = {
      payouts: [
        { providerCode: p1.code, methodCode: m1.code, providerName: p1.name, methodName: m1.name },
        { providerCode: p2.code, methodCode: m2.code, providerName: p2.name, methodName: m2.name },
      ],
      refunds: [
        { providerCode: p1.code, methodCode: m1.code, providerName: p1.name, methodName: m1.name },
        { providerCode: p2.code, methodCode: m2.code, providerName: p2.name, methodName: m2.name },
      ],
    };

    const { statusCode, body } = await sendRequest(query, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);

  });
});
