import request from 'supertest';

import { cleanUp } from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { ApplicationPlatforms } from '@core';

describe('GET /api/providers/{code}/restrictions', () => {
  const sendRequest = (providerCode: string): request.Test =>
    request(baseUrl)
      .get(`api/providers/${providerCode}/restrictions`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should return empty array if there is no any data', async () => {
    const { statusCode, body } = await sendRequest('test');

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(0);
  });

  it('Should return restrictions for both platforms', async () => {
    const { providerRestriction: r1, countryAuthority } = await DataSetBuilder.create()
      .withProvider()
      .withCA()
      .withProviderRestriction({ platform: ApplicationPlatforms.ANDROID })
      .build();
    await DataSetBuilder.create()
      .withProvider({ code: r1.providerCode })
      .withCountry({ iso2: countryAuthority.countryIso2 })
      .withAuthority( { fullCode: countryAuthority.authorityFullCode })
      .withCountriesAuthorities()
      .withProviderRestriction({ platform: ApplicationPlatforms.IOS })
      .build();

    const { statusCode, body } = await sendRequest(r1.providerCode);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual([
      {
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: true,
        countriesAuthorities: [ { authority: countryAuthority.authorityFullCode, country: countryAuthority.countryIso2 } ],
        settings: [],
      },
      {
        platform: ApplicationPlatforms.IOS,
        isEnabled: true,
        countriesAuthorities: [ { authority: countryAuthority.authorityFullCode, country: countryAuthority.countryIso2 } ],
        settings: [],
      },
    ]);
  });

  it('Should return restrictions for multiple CAs', async () => {
    const settings = [{ condition: 'gte', version: '0.0.1' }];
    const settingsString = JSON.stringify(settings);
    const { providerRestriction: r1, countryAuthority: ca1 } = await DataSetBuilder.create()
      .withProvider()
      .withCA()
      .withProviderRestriction({ settings: settingsString })
      .build();
    const { countryAuthority: ca2 } = await DataSetBuilder.create()
      .withProvider({ code: r1.providerCode })
      .withCA()
      .withProviderRestriction({ platform: r1.platform, settings: settingsString })
      .build();

    const { statusCode, body } = await sendRequest(r1.providerCode);

    expect(statusCode).toBe(200);
    expect(body).toHaveLength(1);
    expect(body).toStrictEqual([{
      platform: r1.platform,
      isEnabled: true,
      countriesAuthorities: [{ authority: ca1.authorityFullCode, country: ca1.countryIso2 }, { authority: ca2.authorityFullCode, country: ca2.countryIso2 }],
      settings,
    }]);
  });
});
