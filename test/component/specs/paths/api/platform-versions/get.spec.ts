import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { ApplicationPlatforms, MobilePlatforms } from '@core';
import { DbTable } from '@internal/component-test-library';
import { cleanUp } from '@test-component/utils';

describe('GET /api/platform-versions', () => {
  const sendRequest = (): request.Test =>
    request(baseUrl)
      .get(`api/platform-versions`)
      .withAuth();

  beforeEach(async () => await cleanUp([DbTable.cpPlatforms]));

  it('Should return empty arrays for all platforms', async () => {
    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ android: [], ios: [] });
  });

  it('Should return ordered arrays for all platforms', async () => {
    const androidOrderedTags = ['0.9.1', '1.0.3', '2.1.0'];
    const iosOrderedTags = ['1.2.2', '3.1.4'];
    const dataSet: Array<{ name: MobilePlatforms; version: string }> = [
      {
        name: ApplicationPlatforms.ANDROID,
        version: androidOrderedTags[1],
      },
      {
        name: ApplicationPlatforms.ANDROID,
        version: androidOrderedTags[2],
      },
      {
        name: ApplicationPlatforms.ANDROID,
        version: androidOrderedTags[0],
      },
      {
        name: ApplicationPlatforms.IOS,
        version: iosOrderedTags[1],
      },
      {
        name: ApplicationPlatforms.IOS,
        version: iosOrderedTags[0],
      },
    ];

    await Promise.all(dataSet.map(platform => DataSetBuilder.create().withPlatforms(platform).build()));

    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ android: androidOrderedTags, ios: iosOrderedTags });
  });
});
