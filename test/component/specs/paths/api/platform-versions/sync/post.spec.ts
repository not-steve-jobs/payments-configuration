import request from 'supertest';

import { DbTable } from '@internal/component-test-library';
import { cleanUp } from '@test-component/utils';
import { GetPlatformVersionsResponse } from '@domains/mobile-platforms';

describe('POST /api/platform-versions', () => {
  const APP_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

  const sendSyncRequest = (): request.Test =>
    request(baseUrl)
      .post(`api/platform-versions/sync`)
      .withAuth();

  const sendGetRequest = (): request.Test =>
    request(baseUrl)
      .get(`api/platform-versions`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp([DbTable.cpPlatforms]);
  });

  const verifyTags = (tags: string[]): boolean => tags.every(tag => APP_VERSION_PATTERN.test(tag));

  it('Should add only tags matching X.X.X pattern', async () => {
    await sendSyncRequest();
    const { body: { android : androidTags, ios: iosTags }, statusCode } :
    { body: GetPlatformVersionsResponse; statusCode: number }  = await sendGetRequest();

    expect(statusCode).toBe(200);
    expect(androidTags).toHaveLength(iosTags.length);
    expect(verifyTags((androidTags))).toBe(true);
    expect(verifyTags((iosTags))).toBe(true);
  });


  it('Should not add duplicate tags after second sync', async () => {
    await sendSyncRequest();
    const result1 = await sendGetRequest();
    await sendSyncRequest();
    const result2  = await sendGetRequest();

    expect(result1.statusCode).toBe(200);
    expect(result2.statusCode).toBe(200);
    expect(result1.body).toStrictEqual(result2.body);
  });
});
