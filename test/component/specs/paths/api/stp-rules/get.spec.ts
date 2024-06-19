import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { StpRuleData } from '@core';

describe('GET /api/stp-rules', () => {
  const sendRequest = (): request.Test =>
    request(baseUrl)
      .get(`api/stp-rules`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should return stp rules list', async () => {
    const rule1Data: StpRuleData = {
      valueType: 'list',
      value: ['address', 'id'],
    };
    const [ { stpRule: rule1 }, { stpRule: rule2 }] = await Promise.all([
      DataSetBuilder.create().withStpRule({ id: '1', description: 'desc', data: JSON.stringify(rule1Data) }).build(),
      DataSetBuilder.create().withStpRule({ id: '2' }).build(),
    ]);

    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toEqual(expect.arrayContaining([
      {
        key: rule1.key,
        description: rule1.description,
        order: rule1.order,
        data: rule1Data,
      },
      {
        key: rule2.key,
        description: rule2.description,
        order: rule2.order,
        data: rule2.data,
      },
    ]));
  });
});
