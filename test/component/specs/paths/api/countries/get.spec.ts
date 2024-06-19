import request from 'supertest';

import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

describe('GET /api/countries', () => {
  const sendRequest = ({ authority, providerCode }: { authority?: string; providerCode?: string } = {}): request.Test =>
    request(baseUrl)
      .get(`api/countries`)
      .withAuth()
      .query({ authority, providerCode });

  beforeEach(async () => {
    await cleanUp();
  });

  it(`Should return empty array`, async () => {
    const { authority } = await DataSetBuilder.create().withAuthority({ fullCode: 'emptyCountriesCode' }).build();
    const { statusCode, body } = await sendRequest({ authority: authority.fullCode });

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      countries: [],
    });
  });

  it('Should return countries with all authorities', async () => {
    const ca = await DataSetBuilder.create().withAuthority({ fullCode: 'A' }).withCAMethods().build();
    await DataSetBuilder.create().withAuthority({ fullCode: 'B' }).withCountriesAuthorities({ countryIso2: ca.country.iso2 }).build();

    const { statusCode, body } = await sendRequest();

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      countries: [
        {
          countryGroup: ca.country.group,
          countryData: {
            countryCode: ca.country.iso2,
            countryName: ca.country.name,
            authorities: ['A', 'B'],
          },
        },
      ],
    });
  });

  it(`Should return countries by authority`, async () => {
    const { countryAuthority, country } = await DataSetBuilder.create().withCAMethods().build();

    const { statusCode, body } = await sendRequest({ authority: countryAuthority.authorityFullCode });

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      countries: [
        {
          countryGroup: country.group,
          countryData: {
            countryCode: country.iso2,
            countryName: country.name,
            authorities: [countryAuthority.authorityFullCode],
          },
        },
      ],
    });
  });

  it('Should return countries by providerCode', async () => {
    const pm = await DataSetBuilder.create().withProviderMethods().build();
    await DataSetBuilder.create().withAuthority().withCountriesAuthorities({ countryIso2: pm.country.iso2 }).build();

    const { statusCode, body } = await sendRequest({ providerCode: pm.provider.code });

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      countries: [
        {
          countryGroup: pm.country.group,
          countryData: {
            countryCode: pm.country.iso2,
            countryName: pm.country.name,
            authorities: [pm.countryAuthority.authorityFullCode],
          },
        },
      ],
    });
  });
});
