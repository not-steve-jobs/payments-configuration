import casual from 'casual';
import request from 'supertest';

import * as validators from '@test-component/utils/validators';
import { LooseObject } from '@internal/component-test-library';
import { Paths } from '@typings/openapi';
import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { CpTables } from '@core';

async function getTransactionConfigs(providerId: string): Promise<LooseObject> {
  return await global
    .knexSession(`${CpTables.CP_TRANSACTION_CONFIGS} as tc`)
    .select(`tc.*`)
    .innerJoin(`${CpTables.CP_PROVIDER_METHODS} as pm`, `pm.id`, 'tc.providerMethodId')
    .innerJoin(`${CpTables.CP_PROVIDERS} as p`, `p.id`, `pm.providerId`)
    .where(`p.id`, providerId);
}

describe('PATCH /api/providers/{code}/transaction-configs/bulk-update/', () => {
  beforeEach(async () => {
    await cleanUp();
  });

  const sendRequest = <T extends Paths.BulkUpdateTransactionConfigs.RequestBody>(providerCode: string, data?: T): request.Test =>
    request(baseUrl)
      .patch(`api/providers/${providerCode}/transaction-configs/bulk-update`)
      .withAuth()
      .send(data);

  it('Should throw ERR_VALIDATION_REQUEST if has additional properties', async () => {
    const payload = {
      currencyConfigs: [],
      countryAuthorityMethods: [{ country: 'CY', authority: 'CYSEC', method: 'bankwire' }],
      extraField: [],
    } as Paths.BulkUpdateTransactionConfigs.RequestBody;

    const { statusCode, body } = await sendRequest('test', payload);

    validators.validateMustNotHaveAdditionalProperties('extraField', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if countryAuthorityMethods is empty', async () => {
    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [],
      countryAuthorityMethods: [],
    });

    const { statusCode, body } = await sendRequest('test', payload);

    validators.validateMustNotHaveFewerItemsThan('countryAuthorityMethods', 1, statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST properties fewer than 2', async () => {
    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD' }],
      countryAuthorityMethods: [{ country: 'CY', authority: 'CYSEC', method: 'bankwire' }],
    });

    const { statusCode, body } = await sendRequest('test', payload);

    validators.validateMustNotHaveFewerPropertiesThan('currencyConfigs/0', 2, statusCode, body);
  });

  it.each(['currencyConfigs', 'countryAuthorityMethods'])('Should throw ERR_VALIDATION_REQUEST if %s has additional properties', async property => {
    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD', deposit: { minAmount: 1, maxAmount: 5, isEnabled: false } }],
      countryAuthorityMethods: [{ country: 'CY', authority: 'CYSEC', method: 'bankwire' }],
    });
    Object.assign(payload[property as keyof Paths.BulkUpdateTransactionConfigs.RequestBody][0], { extra: casual.string });

    const { statusCode, body } = await sendRequest('test', payload);

    validators.validateMustNotHaveAdditionalProperties(`${property}/0/extra`, statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if unknown providerCode', async () => {
    await DataSetBuilder.create().withCurrency({ iso3: 'USD' }).build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD', deposit: { minAmount: 1, maxAmount: 5, isEnabled: false } }],
      countryAuthorityMethods: [{ country: 'CY', authority: 'CYSEC', method: 'bankwire' }],
    });

    const { statusCode, body } = await sendRequest('test', payload);

    validators.validateNotFoundError('Unknown Provider', JSON.stringify({ code: 'test' }), statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if there is no such currency', async () => {
    const { provider } = await DataSetBuilder.create().withProvider({ code: 'test' }).build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD', deposit: { minAmount: 1, maxAmount: 5, isEnabled: false } }],
      countryAuthorityMethods: [{ country: 'CY', authority: 'CYSEC', method: 'bankwire' }],
    });

    const { statusCode, body } = await sendRequest(provider.code, payload);

    validators.validateNotFoundError('Unknown currency', 'USD', statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if there is no such country authority for method', async () => {
    const { provider } = await DataSetBuilder.create().withProvider({ code: 'test' }).withCurrency({ iso3: 'USD' }).build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD', deposit: { minAmount: 1, maxAmount: 5, isEnabled: false } }],
      countryAuthorityMethods: [{ country: 'CY', authority: 'CYSEC', method: 'bankwire' }],
    });

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(422);
    expect(body).toMatchObject({
      message: 'For country CY, authority CYSEC, method bankwire is not mapped',
      code: 'ERR_VALIDATION',
    });
  });

  it('Should throw ERR_VALIDATION if min amount greater than current max value', async () => {
    const {
      provider,
      transactionConfig,
      countryAuthority,
      method,
    } = await DataSetBuilder.create().withCurrency({ iso3: 'USD' }).withConfigs({ type: 'deposit', isEnabled: false }).build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD', deposit: { minAmount: transactionConfig.maxAmount! + 1 } }],
      countryAuthorityMethods: [{ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode, method: method.code }],
    });

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(422);
    expect(body).toMatchObject({
      message: 'For USD deposit maxAmount is lower than minAmount',
      code: 'ERR_VALIDATION',
    });
  });

  it('Should throw ERR_VALIDATION if max amount lower than current min value', async () => {
    const {
      provider,
      transactionConfig,
      countryAuthority,
      method,
    } = await DataSetBuilder.create().withCurrency({ iso3: 'USD' }).withConfigs({ type: 'deposit', isEnabled: false, minAmount: 100 }).build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD', deposit: { maxAmount: transactionConfig.minAmount! - 1 } }],
      countryAuthorityMethods: [{ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode, method: method.code }],
    });

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(422);
    expect(body).toMatchObject({
      message: 'For USD deposit maxAmount is lower than minAmount',
      code: 'ERR_VALIDATION',
    });
  });

  it('Should throw ERR_VALIDATION if max amount lower than new min value', async () => {
    const {
      provider,
      countryAuthority,
      method,
    } = await DataSetBuilder.create().withCurrency({ iso3: 'USD' }).withConfigs({ type: 'deposit', isEnabled: false, minAmount: 100 }).build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [{ currency: 'USD', deposit: { maxAmount: 99, minAmount: 100 } }],
      countryAuthorityMethods: [{ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode, method: method.code }],
    });

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(422);
    expect(body).toMatchObject({
      message: 'For USD deposit maxAmount is lower than minAmount',
      code: 'ERR_VALIDATION',
    });
  });

  it('Should update limits if value is 0', async () => {
    const d1 = await DataSetBuilder.create().withCurrency({ iso3: 'USD' }).withConfigs({
      type: 'deposit',
      isEnabled: false,
      minAmount: 5,
      maxAmount: 10,
    }).build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [
        {
          currency: 'USD',
          deposit: { minAmount: 0, maxAmount: 0, isEnabled: false },
        },
      ],
      countryAuthorityMethods: [{ country: d1.countryAuthority.countryIso2, authority: d1.countryAuthority.authorityFullCode, method: d1.method.code }],
    });

    const beforeUpdate = await getTransactionConfigs(d1.provider.id);
    const { statusCode } = await sendRequest(d1.provider.code, payload);
    const afterUpdate = await getTransactionConfigs(d1.provider.id);

    expect(statusCode).toBe(204);
    expect(beforeUpdate[0].minAmount).toBe(5);
    expect(beforeUpdate[0].maxAmount).toBe(10);
    expect(afterUpdate[0].minAmount).toBe(0);
    expect(afterUpdate[0].maxAmount).toBe(0);
  });

  it('Should update limits for certain provider', async () => {
    const [p1, p2] = await Promise.all([
      DataSetBuilder.create().withConfigs().build(),
      DataSetBuilder.create().withCurrency({ iso3: 'USD' }).withConfigs({ type: 'deposit', isEnabled: false }).build(),
    ]);

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [
        {
          currency: 'USD',
          deposit: { minAmount: 1, maxAmount: 5, isEnabled: false },
        },
      ],
      countryAuthorityMethods: [{ country: p2.countryAuthority.countryIso2, authority: p2.countryAuthority.authorityFullCode, method: p2.method.code }],
    });

    const { statusCode } = await sendRequest(p2.provider.code, payload);
    const [configsP1, configsP2] = await Promise.all([
      await getTransactionConfigs(p1.provider.id),
      await getTransactionConfigs(p2.provider.id),
    ]);

    expect(statusCode).toBe(204);
    expect(configsP1).toHaveLength(1);
    expect(configsP2).toHaveLength(1);
    expect(configsP1[0]).toMatchObject({
      minAmount: p1.transactionConfig.minAmount,
      maxAmount: p1.transactionConfig.maxAmount,
      isEnabled: p1.transactionConfig.isEnabled,
    });
    expect(configsP2[0]).toMatchObject({
      minAmount: 1,
      maxAmount: 5,
      isEnabled: 0,
    });
  });

  it('Should create transaction types for currency USD', async () => {
    const { provider, countryAuthority, method } = await DataSetBuilder.create().withCurrency({ iso3: 'USD' }).withProviderMethods().build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [
        {
          currency: 'USD',
          deposit: { minAmount: 1, maxAmount: 5, isEnabled: false },
          payout: { minAmount: 2, isEnabled: true, maxAmount: 6 },
          refund: { minAmount: 3, isEnabled: true, period: 2 },
        },
      ],
      countryAuthorityMethods: [{ country: countryAuthority.countryIso2, authority: countryAuthority.authorityFullCode, method: method.code }],
    });

    const { statusCode } = await sendRequest(provider.code, payload);
    const configs = await getTransactionConfigs(provider.id);

    expect(statusCode).toBe(204);
    expect(configs).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({ currencyIso3: 'USD', type: 'payout', minAmount: 2, maxAmount: 6, isEnabled: 1 }),
      expect.objectContaining({ currencyIso3: 'USD', type: 'refund', minAmount: 3, period: 2, isEnabled: 1 }),
      expect.objectContaining({ currencyIso3: 'USD', type: 'deposit', minAmount: 1, maxAmount: 5, isEnabled: 0 }),
    ]));
  });

  it('Should extend configs with new limits for new currencies', async () => {
    const [p] = await Promise.all([
      DataSetBuilder.create().withConfigs({ type: 'deposit', currencyIso3: 'USD' }).build(),
      DataSetBuilder.create().withCurrency({ iso3: 'USD' }).build(),
      DataSetBuilder.create().withCurrency({ iso3: 'EUR' }).build(),
      DataSetBuilder.create().withCurrency({ iso3: 'ILS' }).build(),
    ]);

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [
        {
          currency: 'EUR',
          deposit: { minAmount: 1, maxAmount: 5, isEnabled: true },
          payout: { minAmount: 4, maxAmount: 9, isEnabled: false },
          refund: { minAmount: 5, period: 10, isEnabled: true },
        },
        {
          currency: 'ILS',
          deposit: { minAmount: 2, maxAmount: 6, isEnabled: false },
          payout: { minAmount: 3, maxAmount: 7, isEnabled: true },
          refund: { minAmount: 4, period: 8, isEnabled: false },
        },
      ],
      countryAuthorityMethods: [{ country: p.countryAuthority.countryIso2, authority: p.countryAuthority.authorityFullCode, method: p.method.code }],
    });

    const { statusCode } = await sendRequest(p.provider.code, payload);
    const configs = await getTransactionConfigs(p.provider.id);

    expect(statusCode).toBe(204);
    expect(configs).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        currencyIso3: 'USD',
        type: 'deposit',
        minAmount: p.transactionConfig.minAmount,
        maxAmount: p.transactionConfig.maxAmount,
        isEnabled: p.transactionConfig.isEnabled,
      }),
      expect.objectContaining({
        currencyIso3: 'EUR',
        type: 'deposit',
        minAmount: 1,
        maxAmount: 5,
        isEnabled: 1,
      }),
      expect.objectContaining({
        currencyIso3: 'EUR',
        type: 'payout',
        minAmount: 4,
        maxAmount: 9,
        isEnabled: 0,
      }),
      expect.objectContaining({
        currencyIso3: 'EUR',
        type: 'refund',
        minAmount: 5,
        period: 10,
        isEnabled: 1,
      }),
      expect.objectContaining({
        currencyIso3: 'ILS',
        type: 'deposit',
        minAmount: 2,
        maxAmount: 6,
        isEnabled: 0,
      }),
      expect.objectContaining({
        currencyIso3: 'ILS',
        type: 'payout',
        minAmount: 3,
        maxAmount: 7,
        isEnabled: 1,
      }),
      expect.objectContaining({
        currencyIso3: 'ILS',
        type: 'refund',
        minAmount: 4,
        period: 8,
        isEnabled: 0,
      }),
    ]));
  });

  it('Should create configs only in one CAM combination', async () => {
    const [p] = await Promise.all([
      DataSetBuilder.create().withConfigs({ type: 'deposit', currencyIso3: 'USD' }).build(),
      DataSetBuilder.create().withCurrency({ iso3: 'USD' }).build(),
      DataSetBuilder.create().withCurrency({ iso3: 'EUR' }).build(),
      DataSetBuilder.create().withCurrency({ iso3: 'ILS' }).build(),
    ]);
    const p2 = await DataSetBuilder.create()
      .withCAMethods()
      .withProviderMethod({ providerId: p.provider.id })
      .withTransactionConfig({ currencyIso3: 'USD', type: 'deposit' })
      .build();

    const payload = mock<Paths.BulkUpdateTransactionConfigs.RequestBody>({
      currencyConfigs: [
        {
          currency: 'EUR',
          deposit: { minAmount: 1, maxAmount: 5, isEnabled: true },
          payout: { minAmount: 4, maxAmount: 9, isEnabled: false },
          refund: { minAmount: 5, period: 10, isEnabled: true },
        },
      ],
      countryAuthorityMethods: [
        { country: p.countryAuthority.countryIso2, authority: p.countryAuthority.authorityFullCode, method: p.method.code },
      ],
    });

    const { statusCode } = await sendRequest(p.provider.code, payload);
    const configs = await getTransactionConfigs(p.provider.id);

    expect(statusCode).toBe(204);
    expect(configs).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        currencyIso3: 'USD',
        type: 'deposit',
        minAmount: p2.transactionConfig.minAmount,
        maxAmount: p2.transactionConfig.maxAmount,
        isEnabled: p2.transactionConfig.isEnabled,
      }),
      expect.objectContaining({
        currencyIso3: 'USD',
        type: 'deposit',
        minAmount: p.transactionConfig.minAmount,
        maxAmount: p.transactionConfig.maxAmount,
        isEnabled: p.transactionConfig.isEnabled,
      }),
      expect.objectContaining({
        currencyIso3: 'EUR',
        type: 'deposit',
        minAmount: payload.currencyConfigs[0].deposit?.minAmount,
        maxAmount: payload.currencyConfigs[0].deposit?.maxAmount,
        isEnabled: Number(payload.currencyConfigs[0].deposit?.isEnabled),
      }),
      expect.objectContaining({
        currencyIso3: 'EUR',
        type: 'payout',
        minAmount: payload.currencyConfigs[0].payout?.minAmount,
        maxAmount: payload.currencyConfigs[0].payout?.maxAmount,
        isEnabled: Number(payload.currencyConfigs[0].payout?.isEnabled),
      }),
      expect.objectContaining({
        currencyIso3: 'EUR',
        type: 'refund',
        minAmount: payload.currencyConfigs[0].refund?.minAmount,
        period: payload.currencyConfigs[0].refund?.period,
        isEnabled: Number(payload.currencyConfigs[0].refund?.isEnabled),
      }),
    ]));
  });
});
