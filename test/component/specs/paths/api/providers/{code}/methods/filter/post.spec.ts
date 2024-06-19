import request from 'supertest';

import { validateMandatoryParamResponse } from '@internal/component-test-library';
import { CommonQueryParameter } from '@test-component/constant';
import { DataSetBuilder } from '@test-component/data';
import { cleanUp } from '@test-component/utils';

describe('POST /api/providers/{code}/methods/filter', () => {
  const sendRequest = (providerCode: string, payload: Record<string, unknown> = {}): request.Test =>
    request(baseUrl)
      .post(`api/providers/${providerCode}/methods/filter`)
      .withAuth()
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(Object.values(CommonQueryParameter))('Should throw if doesnt have required parameter %s', async parameter => {
    const countryAuthorityDto = { country: 'TT', authority: 'tt' };
    delete countryAuthorityDto[parameter];

    const { statusCode, body } = await sendRequest('test', { countriesAuthorities: [countryAuthorityDto] });

    validateMandatoryParamResponse(statusCode, body, { parameter, path: 'body/countriesAuthorities/0' });
  });

  it('Should return not_bounded methods', async () => {
    const [cam1, cam2, p] = await Promise.all([
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withProvider().build(),
    ]);

    const { statusCode, body } = await sendRequest(p.provider.code);

    expect(statusCode).toBe(200);
    expect(body).toContainAllValues([
      { methodCode: cam1.method.code, methodName: cam1.method.name, state: 'not_bounded', boundedCA: [] },
      { methodCode: cam2.method.code, methodName: cam2.method.name, state: 'not_bounded', boundedCA: [] },
    ]);
  });

  it('Should return bounded methods', async () => {
    const [cam1, cam2, p] = await Promise.all([
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withProvider().build(),
    ]);
    await Promise.all([
      DataSetBuilder.create().withProviderMethod({
        providerId: p.provider.id,
        countryAuthorityMethodId: cam1.countryAuthorityMethod.id,
      }).build(),
      DataSetBuilder.create().withProviderMethod({
        providerId: p.provider.id,
        countryAuthorityMethodId: cam2.countryAuthorityMethod.id,
      }).build(),
    ]);

    const { statusCode, body } = await sendRequest(p.provider.code);

    expect(statusCode).toBe(200);
    expect(body).toContainAllValues([
      {
        methodCode: cam1.method.code,
        methodName: cam1.method.name,
        state: 'bounded',
        boundedCA: [{ authority: cam1.authority.fullCode, country: cam1.country.iso2 }],
      },
      {
        methodCode: cam2.method.code,
        methodName: cam2.method.name,
        state: 'bounded',
        boundedCA: [{ authority: cam2.authority.fullCode, country: cam2.country.iso2 }],
      },
    ]);
  });

  it('Should return bounded and not_bounded methods', async () => {
    const [cam1, cam2, p] = await Promise.all([
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withProvider().build(),
    ]);
    await Promise.all([
      DataSetBuilder.create().withProviderMethod({
        providerId: p.provider.id,
        countryAuthorityMethodId: cam1.countryAuthorityMethod.id,
      }).build(),
    ]);

    const { statusCode, body } = await sendRequest(p.provider.code);

    expect(statusCode).toBe(200);
    expect(body).toContainAllValues([
      {
        methodCode: cam1.method.code,
        methodName: cam1.method.name,
        state: 'bounded',
        boundedCA: [{ authority: cam1.authority.fullCode, country: cam1.country.iso2 }],
      },
      { methodCode: cam2.method.code, methodName: cam2.method.name, state: 'not_bounded', boundedCA: [] },
    ]);
  });

  it('Should return not_bounded and bounded methods', async () => {
    const [cam1, cam2, p] = await Promise.all([
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withCAMethods().build(),
      DataSetBuilder.create().withProvider().build(),
    ]);
    await Promise.all([
      DataSetBuilder.create().withProviderMethod({
        providerId: p.provider.id,
        countryAuthorityMethodId: cam1.countryAuthorityMethod.id,
      }).build(),
      DataSetBuilder.create().withProviderMethod({
        providerId: p.provider.id,
        countryAuthorityMethodId: cam2.countryAuthorityMethod.id,
      }).build(),
    ]);

    const { statusCode, body } = await sendRequest(p.provider.code, {
      countriesAuthorities: [
        {
          country: cam1.country.iso2,
          authority: cam1.authority.fullCode,
        },
      ],
    });

    expect(statusCode).toBe(200);
    expect(body).toContainAllValues([
      {
        methodCode: cam1.method.code,
        methodName: cam1.method.name,
        state: 'bounded',
        boundedCA: [ { authority: cam1.authority.fullCode, country: cam1.country.iso2 }],
      },
      { methodCode: cam2.method.code, methodName: cam2.method.name, state: 'not_bounded', boundedCA: [] },
    ]);
  });

  it('Should return mixed and not_bounded methods', async () => {
    const [m1, m2, m3, p] = await Promise.all([
      DataSetBuilder.create().withMethod().build(),
      DataSetBuilder.create().withMethod().build(),
      DataSetBuilder.create().withMethod().build(),
      DataSetBuilder.create().withProvider().build(),
    ]);
    const [ca1, ca2, ca3] = await Promise.all([
      DataSetBuilder.create().withCA().build(),
      DataSetBuilder.create().withCA().build(),
      DataSetBuilder.create().withCA().build(),
    ]);
    const [cam1, cam2, cam3] = await Promise.all([
      DataSetBuilder.create().withCountryAuthorityMethod({ methodId: m1.method.id, countryAuthorityId: ca1.countryAuthority.id }).build(),
      DataSetBuilder.create().withCountryAuthorityMethod({ methodId: m2.method.id, countryAuthorityId: ca2.countryAuthority.id }).build(),
      DataSetBuilder.create().withCountryAuthorityMethod({ methodId: m3.method.id, countryAuthorityId: ca3.countryAuthority.id }).build(),
    ]);

    await DataSetBuilder.create().withProviderMethod({
      providerId: p.provider.id,
      countryAuthorityMethodId: cam1.countryAuthorityMethod.id,
    }).build();
    await DataSetBuilder.create().withProviderMethod({
      providerId: p.provider.id,
      countryAuthorityMethodId: cam2.countryAuthorityMethod.id,
    }).build();
    await DataSetBuilder.create().withProviderMethod({
      providerId: p.provider.id,
      countryAuthorityMethodId: cam3.countryAuthorityMethod.id,
    }).build();

    const { statusCode, body } = await sendRequest(p.provider.code, {
      countriesAuthorities: [
        {
          country: ca1.country.iso2,
          authority: ca1.authority.fullCode,
        },
        {
          country: ca2.country.iso2,
          authority: ca2.authority.fullCode,
        },
      ],
    });

    expect(statusCode).toBe(200);
    expect(body).toContainAllValues([
      { methodCode: m1.method.code, methodName: m1.method.name, state: 'mixed', boundedCA: [{ authority: ca1.authority.fullCode, country: ca1.country.iso2 }] },
      { methodCode: m2.method.code, methodName: m2.method.name, state: 'mixed', boundedCA: [{ authority: ca2.authority.fullCode, country: ca2.country.iso2 }] },
      { methodCode: m3.method.code, methodName: m3.method.name, state: 'not_bounded', boundedCA: [] },
    ]);
  });
});
