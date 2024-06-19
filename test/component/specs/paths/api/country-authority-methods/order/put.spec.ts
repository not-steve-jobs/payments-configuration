import request from 'supertest';

import { CommonMandatoryQueryParameters } from '@test-component/constant';
import { DataSetBuilder, generateCommonAuthorityAndCountryQueryParameters } from '@test-component/data';
import {
  cleanUp,
  validateInvalidCountryLengthResponse,
  validateMandatoryParameterResponse,
} from '@test-component/utils';
import { ErrorCode } from '@internal/component-test-library/lib/src/constants';

describe('PUT /api/country-authority-methods/order', () => {
  const sendRequest = (query: Record<string, unknown>, body: object): request.Test =>
    request(baseUrl)
      .put(`api/country-authority-methods/order`)
      .withAuth()
      .query(query)
      .send(body);

  beforeEach(async () => await cleanUp());

  it.each(CommonMandatoryQueryParameters)(`Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s`, async field => {
    const query = generateCommonAuthorityAndCountryQueryParameters();
    delete query[field];

    const { statusCode, body } = await sendRequest(query, { methodCodes: [] });

    validateMandatoryParameterResponse(field, 'query', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if country longer than 2 symbols', async () => {
    const query = generateCommonAuthorityAndCountryQueryParameters({ country: 'test' });

    const { statusCode, body } = await sendRequest(query, { methodCodes: [] });

    validateInvalidCountryLengthResponse(statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if `methodCodes` is missing', async () => {
    const query = generateCommonAuthorityAndCountryQueryParameters();

    const { statusCode, body } = await sendRequest(query, {});

    validateMandatoryParameterResponse('methodCodes', 'body', statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if CountryAuthority not found', async () => {
    const queryParams = { country: 'XX', authority: 'YY' };
    const payload = { methodCodes: ['cards'] };
    await DataSetBuilder
      .create()
      .withMethod({ code: 'cards' })
      .build();

    const { statusCode, body } = await sendRequest(queryParams, payload);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: `Country's authority not found`,
      meta: { id: `${queryParams.country}:${queryParams.authority}` },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if Method is not represented in CountryAuthority', async () => {
    const queryParams = { country: 'AR', authority: 'GM' };
    const payload = { methodCodes: ['xxx'] };
    await DataSetBuilder
      .create()
      .withCountry({ iso2: queryParams.country })
      .withAuthority({ fullCode: queryParams.authority })
      .withCountriesAuthorities()
      .build();

    const { statusCode, body } = await sendRequest(queryParams, payload);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: `Method "xxx" not found in this Country-Authority`,
      meta: { id: 'xxx' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_CONFLICT if `methodCodes` contains duplicates', async () => {
    const queryParams = { country: 'AR', authority: 'GM' };
    const payload = { methodCodes: ['cards', 'cards'] };
    await DataSetBuilder
      .create()
      .withMethod({ code: 'cards' })
      .withCountry({ iso2: queryParams.country })
      .withAuthority({ fullCode: queryParams.authority })
      .withCountriesAuthorities()
      .build();

    const { statusCode, body } = await sendRequest(queryParams, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: `Method codes contain duplicates`,
      meta: { id: ['cards', 'cards'] },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should update order for each CountryAuthorityMethod', async () => {
    const queryParams = { country: 'AR', authority: 'GM' };
    const payload = { methodCodes: ['cards', 'qr'] };
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withMethod({ code: 'cards' })
      .withCountry({ iso2: queryParams.country })
      .withAuthority({ fullCode: queryParams.authority })
      .withCountriesAuthorities()
      .withCountryAuthorityMethod({ depositsOrder: 1 })
      .build();
    await DataSetBuilder
      .create()
      .withMethod({ code: 'qr' })
      .withCountryAuthorityMethod({ countryAuthorityId: countryAuthority.id, depositsOrder: 0 })
      .build();

    const { statusCode, body } = await sendRequest(queryParams, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
  });

  it('Should be case insensitive', async () => {
    const queryParams = { country: 'AR', authority: 'GM' };
    const payload = { methodCodes: ['CARDS', 'qr'] };
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withMethod({ code: 'cArdS' })
      .withCountry({ iso2: queryParams.country })
      .withAuthority({ fullCode: queryParams.authority })
      .withCountriesAuthorities()
      .withCountryAuthorityMethod({ depositsOrder: 1 })
      .build();
    await DataSetBuilder
      .create()
      .withMethod({ code: 'QR' })
      .withCountryAuthorityMethod({ countryAuthorityId: countryAuthority.id, depositsOrder: 0 })
      .build();

    const { statusCode, body } = await sendRequest(queryParams, payload);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ methodCodes: ['cArdS', 'QR'] });
  });

  it('Should throw CONFLICT_ERROR if a method is missed in request', async () => {
    const queryParams = { country: 'AR', authority: 'GM' };
    const payload = { methodCodes: ['cards'] };
    const { countryAuthority } = await DataSetBuilder
      .create()
      .withMethod({ code: 'cards' })
      .withCountry({ iso2: queryParams.country })
      .withAuthority({ fullCode: queryParams.authority })
      .withCountriesAuthorities()
      .withCountryAuthorityMethod({ depositsOrder: 1 })
      .build();
    await DataSetBuilder
      .create()
      .withMethod({ code: 'QR' })
      .withCountryAuthorityMethod({ countryAuthorityId: countryAuthority.id, depositsOrder: 0 })
      .build();

    const { statusCode, body } = await sendRequest(queryParams, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: `Method "qr" is missed in request`,
      meta: { id: 'qr' },
      requestId: expect.toBeGUID(),
    });
  });
});
