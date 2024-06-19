import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import { ErrorCode } from '@internal/component-test-library';
import { DataSetBuilder, generateStpProviderRuleDto, generateStpRuleDto } from '@test-component/data';
import { StpProviderRuleInterop } from '@domains/interop';

describe('GET /api/interop/stp-rules', () => {
  const sendRequest = (query: Record<string, unknown>): request.Test =>
    request(baseUrl).get(`api/interop/stp-rules`).query(query);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each([
    { providerCode: '', authority: 'string' },
    { providerCode: 'string', authority: '' },
  ])('should throw validation error when query params format is incorrect', async ({ providerCode, authority }) => {
    const { statusCode, body } = await sendRequest({ providerCode, authority });

    expect(statusCode).toBe(400);

    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: expect.any(String),
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('should return stpProviderRules when provided valid data', async () => {
    const stpRule = generateStpRuleDto();
    const stpProviderRule = generateStpProviderRuleDto();

    const result: StpProviderRuleInterop[] = [
      {
        id: Number(stpRule.id),
        key: stpRule.key,
        description: stpRule.description,
        orderId: stpRule.order,
        allowType: null,
        valueType: null,
        value: null,
        enforceAuto: null,
        isEnabled: stpProviderRule.isEnabled,
      },
    ];

    await DataSetBuilder.create().withStpRule(stpRule).build();

    await DataSetBuilder.create()
      .withProvider({ code: 'stripe' })
      .withCountry({ iso2: 'I2' })
      .withAuthority({ fullCode: 'bb' })
      .withMethod()
      .withStpProviderRule(stpProviderRule)
      .build();

    const { statusCode, body } = await sendRequest({
      provider: 'stripe',
      authority: 'bb',
    });

    expect(statusCode).toBe(200);
    expect(body).toMatchObject(result);
  });

  it('should return empty data when stpRule data is null and isEnabled is false', async () => {
    await DataSetBuilder.create().withStpRule({ data: null }).build();

    await DataSetBuilder.create()
      .withProvider({ code: 'any' })
      .withCountry({ iso2: 'an' })
      .withAuthority({ fullCode: 'an' })
      .withMethod()
      .withStpProviderRule({ isEnabled: false, data: null })
      .build();

    const { statusCode, body } = await sendRequest({
      provider: 'stripe',
      authority: 'bb',
    });

    expect(statusCode).toBe(200);
    expect(body).toMatchObject([]);
  });
});
