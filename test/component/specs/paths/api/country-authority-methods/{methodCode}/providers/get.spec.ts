import request from 'supertest';

import {
  DataSetBuilder,
  generateCommonAuthorityAndCountryQueryParameters,
  generateMethodCode,
} from '@test-component/data';
import { CommonMandatoryQueryParameters } from '@test-component/constant';
import {
  cleanUp,
  validateInvalidCountryLengthResponse,
  validateMandatoryParameterResponse,
} from '@test-component/utils';
import { TransactionType } from '@core';

describe('GET /api/country-authority-methods/{methodCode}/providers', () => {
  const sendRequest = (methodCode: unknown, query: Record<string, unknown>): request.Test =>
    request(baseUrl)
      .get(`api/country-authority-methods/${methodCode}/providers`)
      .withAuth()
      .query(query);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(CommonMandatoryQueryParameters)(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s`, async field => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters();
    delete query[field];

    const { statusCode, body } = await sendRequest(methodCode, query);

    validateMandatoryParameterResponse(field, 'query', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if country longer than 2 symbols', async () => {
    const methodCode = generateMethodCode();
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: 'test' });

    const { statusCode, body } = await sendRequest(methodCode, query);

    validateInvalidCountryLengthResponse(statusCode, body);
  });

  it('Should return payment configs', async () => {
    const { currency, countryAuthority, method, provider, providerMethod } = await DataSetBuilder
      .create()
      .withConfigs({
        type: TransactionType.REFUND,
        isEnabled: true,
      }).build();
    const query = generateCommonAuthorityAndCountryQueryParameters({ authority: countryAuthority.authorityFullCode, country: countryAuthority.countryIso2 });

    const { statusCode, body } = await sendRequest(method.code, query);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        providerCode: provider.code,
        providerName: provider.name,
        isEnabled: Boolean(providerMethod.isEnabled),
        currencySettings: [
          {
            currency: currency.iso3,
            deposit: {
              minAmount: null,
              maxAmount: null,
              isEnabled: false,
            },
            payout: {
              minAmount: null,
              maxAmount: null,
              isEnabled: false,
            },
            refund: {
              minAmount: 0,
              period: 0,
              isEnabled: true,
            },
          },
        ],
      },
    ]);
  });
});
