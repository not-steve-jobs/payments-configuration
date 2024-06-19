import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { ProviderBaseDto } from '@core';

describe('GET /api/providers', () => {
  const sendRequest = (): request.Test =>
    request(baseUrl)
      .get(`api/providers`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should return empty providers list', async () => {
    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toEqual([]);
  });

  it('Should return created providers list', async () => {
    const provider1: ProviderBaseDto = {
      code: 'bankwire',
      name: 'Bankwire',
      isEnabled: true,
    };
    const provider2: ProviderBaseDto = {
      code: 'neteller',
      name: 'Neteller',
      isEnabled: false,
    };
    await Promise.all([
      DataSetBuilder.create().withProvider(provider2).build(),
      DataSetBuilder.create().withProvider(provider1).build(),
    ]);

    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toEqual([provider1, provider2]);
  });
});
