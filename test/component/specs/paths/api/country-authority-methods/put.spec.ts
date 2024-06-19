import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { DbTable, dbSelect } from '@internal/component-test-library';

describe('PUT /api/methods', () => {
  beforeEach(async () => await cleanUp());

  const sendRequest = (body: object): request.Test => request(baseUrl)
    .put('api/methods')
    .withAuth()
    .send(body);

  it('Should create a new Method', async () => {
    const payload = { code: 'code', name: 'name', description: 'description' };

    const response = await sendRequest(payload);

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(payload);
  });

  it('Should update an existing Method', async () => {
    const { method } = await DataSetBuilder.create().withMethod({ code: 'code' }).build();
    const payload = { code: 'code', name: 'name_new', description: 'description_new' };

    const response = await sendRequest(payload);
    const selectResponse = await dbSelect(DbTable.cpMethods, {});

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(payload);
    expect(selectResponse).toHaveLength(1);
    expect(selectResponse[0]).toStrictEqual({
      id: method.id,
      code: 'code',
      name: 'name_new',
      description: 'description_new',
      createdAt: method.createdAt,
      updatedAt: expect.toBeString(),
      createdBy: expect.toBeString(),
      updatedBy: expect.toBeString(),
    });
  });
});
