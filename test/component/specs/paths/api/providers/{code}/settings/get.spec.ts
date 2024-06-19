import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { ProviderType } from '@core';

describe('GET /api/providers/{code}/settings', () => {
  const sendRequest = (code: string): request.Test =>
    request(baseUrl)
      .get(`api/providers/${code}/settings`)
      .withAuth();

  beforeEach(async () => await cleanUp());

  it('Should throw ERR_NOT_FOUND if got unknown provider', async () => {
    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown Provider',
      meta: { id: '{\"code\":\"test\"}' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should return provider settings', async () => {
    const { provider } = await DataSetBuilder.create()
      .withCurrency({ iso3: 'USD' })
      .withProvider({ convertedCurrency: 'USD', type: ProviderType.CRYPTO })
      .withMethod()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProviderMethods({ isPayoutAsRefund: true, isPaymentAccountRequired: true })
      .build();
    await DataSetBuilder.create()
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withProviderMethods({ providerId: provider.id, isPayoutAsRefund: false, isPaymentAccountRequired: false })
      .build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      provider: {
        type: ProviderType.CRYPTO,
        convertedCurrency: 'USD',
      },
      countryAuthoritySettings: [
        {
          country: 'AR',
          authority: 'GM',
          settings: { isPayoutAsRefund: false, isPaymentAccountRequired: false, defaultCurrency: null },
        },
        {
          country: 'CY',
          authority: 'CYSEC',
          settings: { isPayoutAsRefund: true, isPaymentAccountRequired: true, defaultCurrency: null },
        },
      ],
    });
  });
});
