import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { STATS_FIELDS_ORDERED } from '@domains/provider-methods/use-cases/export-limits/constants';

describe('GET /api/provider-methods/transaction-configs/export', () => {
  const sendRequest = (): request.Test =>
    request(baseUrl)
      .get(`api/provider-methods/transaction-configs/export`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should return empty report', async () => {
    const { statusCode, text, headers } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(text).toBe('');
    expect(headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(headers['content-disposition']).toMatch(/attachment; filename="cp_export_limits_\d+\.csv"/);
  });

  it('Should return report', async () => {
    const dataSet = await DataSetBuilder.create().withConfigs().build();

    const { statusCode, text, headers } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(text).toStrictEqual([
      [
        STATS_FIELDS_ORDERED.countryName,
        STATS_FIELDS_ORDERED.countryIso3,
        STATS_FIELDS_ORDERED.authorityFullCode,
        STATS_FIELDS_ORDERED.methodName,
        STATS_FIELDS_ORDERED.providerCode,
        STATS_FIELDS_ORDERED.configsType,
        STATS_FIELDS_ORDERED.configsCurrencyIso3,
        STATS_FIELDS_ORDERED.configsMinAmount,
        STATS_FIELDS_ORDERED.configsMaxAmount,
        STATS_FIELDS_ORDERED.configsIsEnabled,
        STATS_FIELDS_ORDERED.configsPeriod,
        STATS_FIELDS_ORDERED.depositsOrder,
        STATS_FIELDS_ORDERED.configsUpdatedAt,
      ],
      [
        dataSet.country.name,
        dataSet.country.iso3,
        dataSet.authority.fullCode,
        dataSet.method.name,
        dataSet.provider.code,
        dataSet.transactionConfig.type,
        dataSet.transactionConfig.currencyIso3,
        dataSet.transactionConfig.minAmount,
        dataSet.transactionConfig.maxAmount,
        Boolean(dataSet.transactionConfig.isEnabled),
        dataSet.transactionConfig.period,
        dataSet.countryAuthorityMethod.depositsOrder,
        dataSet.transactionConfig.updatedAt,
      ],
    ].map(row => row.join(',')).join('\n'));
    expect(headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(headers['content-disposition']).toMatch(/attachment; filename="cp_export_limits_\d+\.csv"/);
  });
});
