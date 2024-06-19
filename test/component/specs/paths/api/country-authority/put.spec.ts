import request from 'supertest';

import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { Paths } from '@typings/openapi';

describe('PUT /api/country-authority', () => {
  beforeEach(async () => await cleanUp());

  const sendRequest = <T extends Paths.CreateCountryAuthority.RequestBody>(body: T): request.Test => request(baseUrl)
    .put('api/country-authority')
    .withAuth()
    .send(body);

  it('Should throw ERR_VALIDATION_REQUEST if payload has extra field', async () => {
    const { statusCode, body } = await sendRequest({ authority: 'CYSEC', country: 'CY', extra: 'test' });

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: { details: '[{"message":"must NOT have additional properties","path":"/body/extra","value":null}]' },
    });
  });

  it('Should throw ERR_NOT_FOUND if unknown country', async () => {
    await DataSetBuilder.create().withAuthority({ fullCode: 'CYSEC' }).build();

    const { statusCode, body } = await sendRequest({ authority: 'CYSEC', country: 'CY' });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Country not found',
      meta: { id: 'CY' },
    });
  });

  it('Should throw ERR_NOT_FOUND if unknown authority', async () => {
    await DataSetBuilder.create().withCountry({ iso2: 'CY' }).build();

    const { statusCode, body } = await sendRequest({ authority: 'CYSEC', country: 'CY' });

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Authority not found',
      meta: { id: 'CYSEC' },
    });
  });

  it('Should throw ERR_CONFLICT if country authority exist', async () => {
    await DataSetBuilder.create()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withCountriesAuthorities({ countryIso2: 'CY', authorityFullCode: 'CYSEC' }).build();

    const { statusCode, body } = await sendRequest({ authority: 'CYSEC', country: 'CY' });

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'CountryAuthority already exists',
      meta: { id: { authority: 'CYSEC', country: 'CY' } },
    });
  });

  it('Should create country-authority', async () => {
    await DataSetBuilder.create()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .build();

    const { statusCode, body } = await sendRequest({ authority: 'CYSEC', country: 'CY' });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ authority: 'CYSEC', country: 'CY' });
  });
});
