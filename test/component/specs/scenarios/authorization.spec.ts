import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { Roles } from '@api/middlewares';
import { ProviderType } from '@core';

describe('Authorization', () => {
  beforeEach(async () => {
    await cleanUp();
  });

  it(`Should pass all requests if role is "${Roles.ADMIN}"`, async () => {
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProvider({ code: 'stripe' })
      .withProviderMethods()
      .build();

    const [getResponse, putResponse] = await Promise.all([
      request(baseUrl)
        .get('api/providers')
        .withAuth(),

      request(baseUrl)
        .put('api/providers/stripe/settings')
        .withAuth()
        .send({
          provider: {
            type: ProviderType.DEFAULT,
            convertedCurrency: null,
          },
          countryAuthoritySettings: [{
            country: 'CY',
            authority: 'CYSEC',
            settings: { isPayoutAsRefund: false, isPaymentAccountRequired: false },
          }],
        }),
    ]);

    expect(getResponse.status).toBe(200);
    expect(putResponse.status).toBe(200);
  });

  it(`Should pass only GET requests if role is "${Roles.VIEWER}"`, async () => {
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProvider({ code: 'stripe' })
      .withProviderMethods()
      .build();

    const [getResponse, putResponse] = await Promise.all([
      request(baseUrl)
        .get('api/providers')
        .withAuth(Roles.VIEWER),

      request(baseUrl)
        .put('api/providers/stripe/settings')
        .withAuth(Roles.VIEWER)
        .send({
          provider: {
            type: ProviderType.DEFAULT,
            convertedCurrency: null,
          },
          countryAuthoritySettings: [{
            country: 'CY',
            authority: 'CYSEC',
            settings: { isPayoutAsRefund: false, isPaymentAccountRequired: false },
          }],
        }),
    ]);

    expect(getResponse.status).toBe(200);
    expect(putResponse.status).toBe(403);
  });

  it('Should throw ERR_FORBIDDEN if a request has no Authorization header', async () => {
    const response = await request(baseUrl).get('api/providers');

    expect(response.status).toBe(401);
  });
});
