import casual from 'casual';
import request from 'supertest';

import { DataSetBuilder, generateUpsertConfigServicePayload } from '@test-component/data';
import { UpsertConfigParameters } from '@test-component/constant';
import { DbTable, ErrorCode, LooseObject, dbSelect } from '@internal/component-test-library';
import { cleanUp, validateMandatoryParameterResponse } from '@test-component/utils';

beforeEach(async () => await cleanUp());

describe('PUT /api/config', () => {
  const sendRequest = (payload: object): request.Test =>
    request(baseUrl)
      .put(`api/config`)
      .withAuth()
      .send(payload);

  it('Should throw ERR_VALIDATION_REQUEST if payload is not an object', async () => {
    const { statusCode, body } = await sendRequest([]);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must be object","path":"/body","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it.each(Object.values(UpsertConfigParameters))('Should throw ERR_VALIDATION_REQUEST if there is no mandatory field %s', async field => {
    const payload = generateUpsertConfigServicePayload();
    delete payload[field];

    const { statusCode, body } = await sendRequest(payload);

    validateMandatoryParameterResponse(field, 'body', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if provider.code is invalid', async () => {
    const payload = generateUpsertConfigServicePayload({
      provider: { code: ')(   []', name: 'test' },
    });
    const { statusCode, body } = await sendRequest(payload);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: `[{"message":"must match pattern \\\"^[A-Za-z0-9_]+$\\\"","path":"/body/provider/code","value":null}]`,
      },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_CONFLICT if provider.name is not unique', async () => {
    const payload = generateUpsertConfigServicePayload({
      provider: { code: 'stripe', name: 'Unlimint' },
      countryAuthorityMethods: [ { country: 'AR', authority: 'GM', method: 'cards' } ],
    });
    await DataSetBuilder.create()
      .withProvider({ code: 'stripe', name: 'Stripe' })
      .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withCA()
      .build();
    await DataSetBuilder.create()
      .withProvider({ code: 'unlimint', name: 'Unlimint' })
      .build();

    const { statusCode, body } = await sendRequest(payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'Provider name must be unique',
      meta: {},
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_MAX_ALLOWED_METHODS_EXCEEDED', async () => {
    const countryAuthorityMethods = Array.from(new Array(5000)).reduce((acc, _) => {
      acc.push({ country: casual.country_code.toUpperCase(), authority: casual.country_code.toUpperCase(), method: casual.string.slice(0, 50) });
      return acc;
    }, [] as LooseObject);

    const payload = generateUpsertConfigServicePayload({ countryAuthorityMethods });

    const { statusCode, body }  = await sendRequest(payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_MAX_ALLOWED_METHODS_EXCEEDED',
      message: 'Exceeded maximum allowed methods',
      meta: {},
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_CONFLICT if `countryAuthorityMethods` contains duplicates', async () => {
    const payload = generateUpsertConfigServicePayload({
      countryAuthorityMethods: [
        { country: 'AR', authority: 'GM', method: 'cards' },
        { country: 'AR', authority: 'GM', method: 'cards' },
      ],
    });
    await DataSetBuilder.create()
      .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withCA()
      .build();

    const { statusCode, body }  = await sendRequest(payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: '`countryAuthorityMethods` contains duplicates',
      meta: {},
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw NOT_FOUND if got unknown `method` inside `countryAuthorityMethods`', async () => {
    const payload = generateUpsertConfigServicePayload({
      countryAuthorityMethods: [
        { country: 'AR', authority: 'GM', method: 'test' },
      ],
    });
    await DataSetBuilder.create()
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withCA()
      .build();

    const { statusCode, body }  = await sendRequest(payload);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown method "test"',
      meta: { id: 'test' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should remove all providerMethods if `countriesAuthorities` is an empty array', async () => {
    const payload = generateUpsertConfigServicePayload({
      countryAuthorityMethods: [],
    });
    const { provider } = await DataSetBuilder.create()
      .withProvider({ ...payload.provider })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withProviderMethods({ isEnabled: true })
      .build();
    await DataSetBuilder.create()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withProviderMethods({ providerId: provider.id, isEnabled: true })
      .build();

    const { statusCode, body } = await sendRequest(payload);
    const dbProviderMethods = await dbSelect(DbTable.cpProviderMethods, {});

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      provider: { name: 'Stripe', code: 'stripe' },
      countryAuthorityMethods: [],
    });
    expect(dbProviderMethods).toHaveLength(0);
  });

  it('Should create Provider, CountryAuthorityMethods and ProviderMethods if not exist', async () => {
    const payload = generateUpsertConfigServicePayload({
      countryAuthorityMethods: [
        { country: 'AR', authority: 'GM', method: 'cards' },
        { country: 'CY', authority: 'CYSEC', method: 'cards' },
      ],
    });
    await Promise.all([
      DataSetBuilder.create()
        .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
        .withCountry({ iso2: 'AR' })
        .withAuthority({ fullCode: 'GM' })
        .withCA()
        .build(),
      DataSetBuilder.create()
        .withCountry({ iso2: 'CY' })
        .withAuthority({ fullCode: 'CYSEC' })
        .withCA()
        .build(),
    ]);

    const { statusCode, body }  = await sendRequest(payload);
    const [countryAuthorityMethods, providerMethods] = await Promise.all([
      dbSelect(DbTable.cpCountryAuthorityMethods, {}),
      dbSelect(DbTable.cpProviderMethods, {}),
    ]);

    expect(countryAuthorityMethods).toHaveLength(2);
    expect(providerMethods).toHaveLength(2);
    expect(providerMethods.filter(pm => pm.countryAuthorityMethodId === countryAuthorityMethods[0].id)).toHaveLength(1);
    expect(providerMethods.filter(pm => pm.countryAuthorityMethodId === countryAuthorityMethods[1].id)).toHaveLength(1);
    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      provider: { name: 'Stripe', code: 'stripe' },
      countryAuthorityMethods: [
        {
          country: 'CY',
          authority: 'CYSEC',
          methodCode: 'cards',
          methodName: 'Visa/Mastercard',
          isEnabled: false,
        },
        {
          country: 'AR',
          authority: 'GM',
          methodCode: 'cards',
          methodName: 'Visa/Mastercard',
          isEnabled: false,
        },
      ],
    });
  });

  it('Should work with existing CountryAuthorityMethod and ProviderMethod', async () => {
    const payload = generateUpsertConfigServicePayload({ convertedCurrency: 'EUR' });
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider(payload.provider)
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
      .withProviderMethods({ isEnabled: true })
      .build();

    const { statusCode, body }  = await sendRequest(payload);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      provider: { name: 'Stripe', code: 'stripe' },
      countryAuthorityMethods: [
        {
          country: 'AR',
          authority: 'GM',
          methodCode: 'cards',
          methodName: 'Visa/Mastercard',
          isEnabled: false,
        },
      ],
    });
  });

  it('Should remove ProviderMethod (+ related fields and transactionConfigs) that was not specified in the request', async () => {
    const payload = generateUpsertConfigServicePayload({ convertedCurrency: 'EUR' });
    const updatedPmId = casual.uuid;
    const removedPmId = casual.uuid;
    const { provider, method } = await DataSetBuilder.create()
      .withProvider({ ...payload.provider })
      .withCurrency({ iso3: 'EUR' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
      .withProviderMethods({ id: updatedPmId, isEnabled: true })
      .withField()
      .withTransactionConfig()
      .build();
    await DataSetBuilder.create()
      .withCurrency()
      .withCountry({ iso2: 'CY' })
      .withAuthority({ fullCode: 'CYSEC' })
      .withCAMethods({ methodId: method.id })
      .withProviderMethod({ id: removedPmId, providerId: provider.id, isEnabled: true })
      .withField()
      .withTransactionConfig()
      .build();

    const { statusCode, body }  = await sendRequest(payload);

    const [removedPm, dbFields, dbConfigs] = await Promise.all([
      dbSelect(DbTable.cpProviderMethods, { id: removedPmId }),
      dbSelect(DbTable.cpFields, {}),
      dbSelect(DbTable.cpTransactionConfigs, {}),
    ]);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      provider: { name: 'Stripe', code: 'stripe' },
      countryAuthorityMethods: [
        {
          country: 'AR',
          authority: 'GM',
          methodCode: 'cards',
          methodName: 'Visa/Mastercard',
          isEnabled: false,
        },
      ],
    });
    expect(removedPm).toHaveLength(0);
    expect(dbFields.filter(f => f.entityId === removedPmId)).toHaveLength(0);
    expect(dbFields.filter(f => f.entityId === updatedPmId)).toHaveLength(1);
    expect(dbConfigs.filter(c => c.providerMethodId === removedPmId)).toHaveLength(0);
    expect(dbConfigs.filter(c => c.providerMethodId === updatedPmId)).toHaveLength(1);
  });

  it('Should update Provider name if exists', async () => {
    const payload = generateUpsertConfigServicePayload({
      provider: { code: 'stripe', name: 'Stripe NEW' },
      convertedCurrency: 'EUR',
    });
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider({ code: 'stripe', name: 'Stripe OLD' })
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
      .withProviderMethods({ isEnabled: true })
      .build();

    const { statusCode, body }  = await sendRequest(payload);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      provider: { name: 'Stripe NEW', code: 'stripe' },
      countryAuthorityMethods: [
        {
          country: 'AR',
          authority: 'GM',
          methodCode: 'cards',
          methodName: 'Visa/Mastercard',
          isEnabled: false,
        },
      ],
    });
  });

  it('Should not update isPayoutAsRefund if this prop is not represented in request', async () => {
    const payload = generateUpsertConfigServicePayload();
    payload.isPayoutAsRefund = undefined;
    await DataSetBuilder.create()
      .withCurrency({ iso3: 'EUR' })
      .withProvider(payload.provider)
      .withCountry({ iso2: 'AR' })
      .withAuthority({ fullCode: 'GM' })
      .withMethod({ code: 'cards', name: 'Visa/Mastercard' })
      .withProviderMethods({ isEnabled: true, isPayoutAsRefund: true })
      .build();

    const { statusCode, body }  = await sendRequest(payload);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({
      provider: { name: 'Stripe', code: 'stripe' },
      countryAuthorityMethods: [
        {
          country: 'AR',
          authority: 'GM',
          methodCode: 'cards',
          methodName: 'Visa/Mastercard',
          isEnabled: false,
        },
      ],
    });
  });
});
