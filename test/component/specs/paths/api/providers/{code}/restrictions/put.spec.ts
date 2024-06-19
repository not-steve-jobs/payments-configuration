import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import {
  DataSetBuilder,
  generateCommonAuthorityAndCountryQueryParameters,
  generateProviderRestrictionsGroupDto,
} from '@test-component/data';
import { ApplicationPlatforms, CountryAuthorityDto } from '@core';

describe('PUT /api/providers/{code}/restrictions', () => {
  const sendRequest = (providerCode: string, payload: object): request.Test =>
    request(baseUrl)
      .put(`api/providers/${providerCode}/restrictions`)
      .withAuth()
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should throw not found error for a non existing provider', async () => {
    const ca = generateCommonAuthorityAndCountryQueryParameters() as CountryAuthorityDto;
    const r1 = generateProviderRestrictionsGroupDto({ countriesAuthorities: [ca] });

    const { statusCode, body } = await sendRequest('fake', [r1]);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      message: 'Unknown Provider',
      code: 'ERR_NOT_FOUND',
    });
  });

  it('Should throw not found error for a non existing country authority', async () => {
    const ca = generateCommonAuthorityAndCountryQueryParameters() as CountryAuthorityDto;
    const r1 = generateProviderRestrictionsGroupDto({ countriesAuthorities: [ca] });
    const  { provider } = await DataSetBuilder.create().withProvider().build();

    const { statusCode, body } = await sendRequest(provider.code, [r1]);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'In the request there are countries-authorities that are not mapped to the provider',
      code: 'ERR_CONFLICT',
    });
  });

  it('Should throw BadRequest for empty countriesAuthorities', async () => {
    const { provider } = await DataSetBuilder.create().withProvider().build();
    const r1 = generateProviderRestrictionsGroupDto();
    const { statusCode, body } = await sendRequest(provider.code, [r1]);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      message: 'Bad Request',
      code: 'ERR_VALIDATION_REQUEST',
    });
  });

  it('Should create restrictions for both platforms and the same country authority', async () => {
    const { provider, countryAuthority } = await DataSetBuilder.create().withProviderMethods().build();
    const r1 = generateProviderRestrictionsGroupDto({
      platform: ApplicationPlatforms.ANDROID,
      countriesAuthorities: [{
        authority: countryAuthority.authorityFullCode,
        country: countryAuthority.countryIso2,
      }],
    });
    const r2 = generateProviderRestrictionsGroupDto({
      platform: ApplicationPlatforms.IOS,
      countriesAuthorities: [{
        authority: countryAuthority.authorityFullCode,
        country: countryAuthority.countryIso2,
      }],
    });
    const { statusCode, body } = await sendRequest(provider.code, [r1, r2]);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject([r1, r2]);
  });
});

