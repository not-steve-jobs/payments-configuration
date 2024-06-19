import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

const data = JSON.stringify([
  { key: 'test', isEnabled: true, type: 'number', value: '2' },
  { key: 'test2', isEnabled: true, type: 'number', value: '4' },
  { key: 'test3', isEnabled: true, type: 'list', value: ['6', '5'] },
]);

describe.skip('GET /api/providers/{code}/stp-rules', () => {
  const sendRequest = (providerCode: string): request.Test =>
    request(baseUrl)
      .get(`api/providers/${providerCode}/stp-rules`)
      .withAuth()
      .send(data);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw NOT_FOUND if unknown provider', async () => {
    const { statusCode, body } = await sendRequest('unknown');

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown Provider',
      meta: { id: '{"code":"unknown"}' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should return an empty array of STP rules when no STP provider rules are available', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withAuthority({ fullCode: 'FSCM' }).build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('Should throw ERR_VALIDATION_REQUEST if stpRules is empty', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'FSCM',
      isEnabled: true,
      data: null,
    }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'GM',
      isEnabled: true,
      data: null,
    }).build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(500);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_GENERIC,
      message: '/response/0/stpRules must NOT have fewer than 1 items',
    });
  });

  it('Should return two distinct groups when the data differs', async () => {
    const data2 = JSON.stringify([
      { key: 'test', isEnabled: true, type: 'number', value: '2' },
      { key: 'test2', isEnabled: true, type: 'number', value: '4' },
    ]);
    await DataSetBuilder.create().withProvider({ code: 'test' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'FSCM',
      isEnabled: true,
      data,
    }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'GM',
      isEnabled: true,
      data: data2,
    }).build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        countriesAuthorities: [{ authority: 'FSCM' }],
        isEnabled: true,
        stpRules: JSON.parse(data),
      },
      {
        countriesAuthorities: [{ authority: 'GM' }],
        isEnabled: true,
        stpRules: JSON.parse(data2),
      },
    ]);
  });

  it('Should return the same number of STP rules for specific authorities (FSCM, GM)', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'FSCM',
      isEnabled: true,
      data,
    }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'GM',
      isEnabled: true,
      data,
    }).build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        countriesAuthorities: [{ authority: 'FSCM' }, { authority: 'GM' }],
        isEnabled: true,
        stpRules: JSON.parse(data),
      },
    ]);
  });

  it('Should return distinct rule sets based on different global isEnabled values', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'FSCM',
      isEnabled: true,
      data,
    }).build();
    await DataSetBuilder.create().withStpProviderRule({
      providerCode: 'test',
      authorityFullCode: 'GM',
      isEnabled: false,
      data,
    }).build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        countriesAuthorities: [{ authority: 'FSCM' }],
        isEnabled: true,
        stpRules: JSON.parse(data),
      },
      {
        countriesAuthorities: [{ authority: 'GM' }],
        isEnabled: false,
        stpRules: JSON.parse(data),
      },
    ]);
  });
});
