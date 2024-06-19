import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';

describe('GET /api/provider-methods/withdrawals-order', () => {
  const sendRequest = (query: Record<string, string>): request.Test =>
    request(baseUrl)
      .get(`api/provider-methods/withdrawals-order`)
      .withAuth()
      .query(query);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw an error for non existing country-authority', async () => {
    const query: Record<string, string> = { authority: 'GM', country: 'AU' };

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: "Country's authority not found",
      code: 'ERR_NOT_FOUND',
      meta: { id: 'AU:GM' },
    });
  });

  it('Should return empty withdrawals order', async () => {
    const query: Record<string, string> = { authority: 'GM', country: 'AU' };
    await DataSetBuilder.create()
      .withCountry({ iso2: query.country })
      .withAuthority({ fullCode: query.authority })
      .withCountriesAuthorities()
      .build();

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ payouts: [], refunds: [] });
  });

  it('Should return only enabled', async () => {
    const query: Record<string, string> = { authority: 'GM', country: 'AU' };

    const set1 = await DataSetBuilder.create()
      .withCountry({ iso2: query.country })
      .withAuthority({ fullCode: query.authority })
      .withCountriesAuthorities({ countryIso2: query.country, authorityFullCode:query.authority })
      .withProviderMethods({ isEnabled: true })
      .build();
    await DataSetBuilder.create()
      .withCountry({ ...set1.country })
      .withAuthority({ ...set1.authority })
      .withCountriesAuthorities({ ...set1.countryAuthority })
      .withProviderMethods({ isEnabled: false })
      .build();
    const { provider: p1, method: m1 } = set1;

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ payouts: [
      {
        providerCode: p1.code,
        providerName: p1.name,
        methodCode: m1.code,
        methodName: m1.name,
      },
    ], refunds: [
      {
        providerCode: p1.code,
        providerName: p1.name,
        methodCode: m1.code,
        methodName: m1.name,
      },
    ] });
  });

  it('Should return ordered withdrawals types', async () => {
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

    const { statusCode, body } = await sendRequest(query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ payouts: [
      {
        providerCode: p1.code,
        providerName: p1.name,
        methodCode: m1.code,
        methodName: m1.name,
      },
      {
        providerCode: p2.code,
        providerName: p2.name,
        methodCode: m2.code,
        methodName: m2.name,
      },
    ], refunds: [
      {
        providerCode: p2.code,
        providerName: p2.name,
        methodCode: m2.code,
        methodName: m2.name,
      },
      {
        providerCode: p1.code,
        providerName: p1.name,
        methodCode: m1.code,
        methodName: m1.name,
      },
    ] });
  });
});
