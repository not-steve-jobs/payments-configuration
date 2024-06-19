import request from 'supertest';

import { NotFoundError } from '@internal/errors-library';
import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { Roles } from '@api/middlewares';

describe('GET /api/providers/{code}/credentials/', () => {
  const sendRequest = (providerCode: string, role?: Roles): request.Test =>
    request(baseUrl)
      .get(`api/providers/${providerCode}/credentials`)
      .withAuth(role);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw if has unknown providerCode', async () => {
    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: 'Unknown Provider',
      code: NotFoundError.code,
      meta: { id: '{"code":"test"}' },
    });
  });

  it('Should return empty array if there is no any data', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).build();

    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ credentialsData: [] });
  });

  it('Should return common credentials', async () => {
    const { provider, credential } = await DataSetBuilder.create().withProvider().withCredential().build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      credentialsData: [
        {
          parameters: {},
          credentialsDetails: JSON.parse(credential.credentialsDetails),
        },
      ],
    });
  });

  it('Should return common and specific credentials', async () => {
    const { provider, credential } = await DataSetBuilder.create().withProvider().withCredential().build();
    const { credential: credentialSpecific } = await DataSetBuilder.create().withAuthority({ fullCode: 'CYSEC' }).withCredential({
      providerCode: provider.code,
    }).build();

    const { statusCode, body } = await sendRequest(provider.code);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      credentialsData: [
        {
          parameters: {},
          credentialsDetails: JSON.parse(credential.credentialsDetails),
        },
        {
          parameters: { countryAuthorities: [ { authority: 'CYSEC' } ], currencies: [] },
          credentialsDetails: JSON.parse(credentialSpecific.credentialsDetails),
        },
      ],
    });
  });

  it('Should return masked credential values if user has no "admin" role', async () => {
    const { provider } = await DataSetBuilder.create().withProvider().withCredential({
      credentialsDetails: JSON.stringify([{ key: 'apiKey', value: 'secret' }]),
    }).build();
    await DataSetBuilder.create().withAuthority({ fullCode: 'CYSEC' }).withCredential({
      providerCode: provider.code,
      credentialsDetails: JSON.stringify([{ key: 'apiKey', value: 'secret' }]),
    }).build();

    const { statusCode, body } = await sendRequest(provider.code, Roles.VIEWER);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      credentialsData: [
        {
          parameters: {},
          credentialsDetails: [ { key: 'apiKey', value: '******' } ],
        },
        {
          parameters: { countryAuthorities: [ { authority: 'CYSEC' } ], currencies: [] },
          credentialsDetails: [ { key: 'apiKey', value: '******' } ],
        },
      ],
    });
  });
});
