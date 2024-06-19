import request from 'supertest';

import * as validators from '@test-component/utils/validators';
import { DbTable, dbSelect } from '@internal/component-test-library';
import { ErrorCode } from '@internal/component-test-library/lib/src/constants';
import { cleanUp } from '@test-component/utils';
import { Components, Paths } from '@typings/openapi';
import { DataSetBuilder } from '@test-component/data';

const MANDATORY_FIELDS = ['countriesAuthorities', 'stpRules', 'isEnabled'];
const STP_RULE_MANDATORY_FIELDS = ['key', 'isEnabled'];

describe('PUT /api/providers/{code}/stp-rules', () => {
  const unsupportedStpRulesValues = [1, true, {}, [1], [null], [true], {}];
  const sendRequest = <T extends Paths.UpdateStpProviderRules.RequestBody>(providerCode: string, data?: T): request.Test =>
    request(baseUrl)
      .put(`api/providers/${providerCode}/stp-rules`)
      .withAuth()
      .send(data);

  beforeEach(async () => {
    await cleanUp();
  });

  it.each(MANDATORY_FIELDS)('Should throw ERR_VALIDATION_REQUEST if doesnt have mandatory %s', async field => {
    const payload: Components.Schemas.StpProviderRulesDto = {
      isEnabled: true,
      stpRules: [{ key: '', value: 'g', type: 'number', isEnabled: true }],
      countriesAuthorities: [{ authority: 'CYSEC' }],
    };
    delete payload[field as keyof Components.Schemas.StpProviderRulesDto];

    const { statusCode, body } = await sendRequest('unknown', [payload]);

    validators.validateMandatoryParameterResponse(field, 'body/0', statusCode, body);
  });

  it.each(STP_RULE_MANDATORY_FIELDS)('Should throw ERR_VALIDATION_REQUEST if stpRule doesnt have mandatory %s', async field => {
    const payload: Components.Schemas.StpProviderRulesDto = {
      isEnabled: true,
      stpRules: [{ key: '', value: 'g', type: 'number', isEnabled: true }],
      countriesAuthorities: [{ authority: 'CYSEC' }],
    };
    delete payload.stpRules[0][field as keyof Components.Schemas.StpProviderRulesDto['stpRules'][0]];

    const { statusCode, body } = await sendRequest('unknown', [payload]);

    validators.validateMandatoryParameterResponse(field, 'body/0/stpRules/0', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if has additional properties', async () => {
    const { statusCode, body } = await sendRequest('unknown', [
      { isEnabled: true, stpRules: [{ key: '', value: 'g', type: 'number', isEnabled: true }], countriesAuthorities: [{ authority: 'CYSEC' }], extraField: 1 },
    ]);

    validators.validateMustNotHaveAdditionalProperties('0/extraField', statusCode, body);
  });

  it.skip('Should throw ERR_VALIDATION_REQUEST if stpRules has additional properties', async () => {
    const { statusCode, body } = await sendRequest('unknown', [
      {
        isEnabled: true,
        stpRules: [{ key: '', value: 'g', type: 'number', isEnabled: true, extra: 12345 }],
        countriesAuthorities: [{ authority: 'CYSEC' }],
      },
    ]);

    validators.validateMustNotHaveAdditionalProperties('0/stpRules/0/extra', statusCode, body);
  });

  it('Should throw ERR_VALIDATION_REQUEST if countriesAuthorities is empty', async () => {
    const { statusCode, body } = await sendRequest('unknown', [
      { isEnabled: true, stpRules: [{ key: '', value: 'g', type: 'number', isEnabled: true }], countriesAuthorities: [] },
    ] as unknown as Paths.UpdateStpProviderRules.RequestBody);

    validators.validateMustNotHaveFewerItemsThan('0/countriesAuthorities', 1, statusCode, body);
  });

  it('Should throw ERR_NOT_FOUND if unknown provider', async () => {
    const { statusCode, body } = await sendRequest('unknown', [
      { isEnabled: true, stpRules: [{ key: '', value: 'g', type: 'number', isEnabled: false }], countriesAuthorities: [{ authority: 'CYSEC' }] },
    ]);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown Provider',
      meta: { id: '{"code":"unknown"}' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if unknown rule key', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).build();

    const { statusCode, body } = await sendRequest('test', [
      { isEnabled: true, stpRules: [{ key: 'new', isEnabled: true }], countriesAuthorities: [{ authority: 'CYSEC' }] },
    ]);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown rule key',
      meta: { id: 'new' },
      requestId: expect.toBeGUID(),
    });
  });

  it.each(['', ['']])('Should throw ERR_VALIDATION_REQUEST if value of stpRules is empty', async v => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withStpRule({ key: 'key' }).build();

    const { statusCode, body } = await sendRequest('test', [
      { isEnabled: true, stpRules: [{ key: 'key', isEnabled: true, value: v }], countriesAuthorities: [{ authority: 'CYSEC' }] },
    ] as unknown as Paths.UpdateStpProviderRules.RequestBody);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: { details: expect.stringContaining(`must NOT have fewer than 1 characters`) },
      requestId: expect.toBeGUID(),
    });
  });

  it.each(unsupportedStpRulesValues)('Should throw ERR_VALIDATION_REQUEST if stpRule value is %s', async v => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withStpRule({ key: 'key' }).build();

    const { statusCode, body } = await sendRequest('test', [
      { isEnabled: true, stpRules: [{ key: 'key', isEnabled: true, value: v }], countriesAuthorities: [{ authority: 'CYSEC' }] },
    ] as unknown as Paths.UpdateStpProviderRules.RequestBody);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: { details: expect.stringContaining(`must be string`) },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if unknown authority', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withStpRule({ key: 'key' }).build();

    const { statusCode, body } = await sendRequest('test', [
      { isEnabled: true, stpRules: [{ key: 'key', isEnabled: true }], countriesAuthorities: [{ authority: 'CYSEC' }] },
    ]);

    expect(statusCode).toBe(404);
    expect(body).toMatchObject({
      code: ErrorCode.ERR_NOT_FOUND,
      message: 'Unknown authority',
      meta: { id: 'CYSEC' },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_CONFLICT if rules has duplicates by key', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withStpRule({ key: 'key' }).build();

    const { statusCode, body } = await sendRequest('test', [
      { isEnabled: true, stpRules: [{ key: 'key', isEnabled: true }, { key: 'key', isEnabled: true }], countriesAuthorities: [{ authority: 'CYSEC' }] },
    ]);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      code: 'ERR_CONFLICT',
      message: 'In the request there are rules with duplicates',
      meta: { id: { key: 'key', countriesAuthorities: [{ authority: 'CYSEC' }] } },
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw ERR_NOT_FOUND if provider does not exist in an authority', async () => {
    await DataSetBuilder.create().withProvider({ code: 'test' }).withAuthority({ fullCode: 'CYSEC' }).withStpRule({ key: 'key' }).build();

    const { statusCode, body } = await sendRequest('test', [
      { isEnabled: true, stpRules: [{ key: 'key', isEnabled: true }], countriesAuthorities: [{ authority: 'CYSEC' }] },
    ]);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'In the request there are countries-authorities that are not mapped to the provider',
      code: 'ERR_CONFLICT',
      meta: { id: 'CYSEC' },
    });
  });

  it('Should throw ERR_VALIDATION_REQUEST if stpRules is empty', async () => {
    // Seed stp rules and authorities
    await DataSetBuilder.create().withStpRule({ id: '1', key: 'allowedProfileStatuses' }).withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '2', key: 'allowedVaultColors' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '3', key: 'requiredBackgroundChecks' }).withAuthority({ fullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withStpRule({ id: '4', key: 'requiredBackgroundChecks' }).build();
    // Seed provider and bound with new authorities
    const { provider } = await DataSetBuilder.create().withConfigs().withCountriesAuthorities({ authorityFullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'GM' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'FSCM' }).build();

    const payload = [
      {
        isEnabled: true,
        stpRules: [],
        countriesAuthorities: [{ authority: 'CYSEC' }],
      },
    ] as unknown as Paths.UpdateStpProviderRules.RequestBody;

    const { statusCode, body } = await sendRequest(provider.code, payload);

    validators.validateMustNotHaveFewerItemsThan('0/stpRules', 1, statusCode, body);
  });

  it('Should throw ERR_CONFLICT if only value inside of stpRules was sent', async () => {
    // Seed stp rules and authorities
    await DataSetBuilder.create().withStpRule({ id: '1', key: 'allowedProfileStatuses' }).withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '2', key: 'allowedVaultColors' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '3', key: 'requiredBackgroundChecks' }).withAuthority({ fullCode: 'CYSEC' }).build();
    // Seed provider and bound with new authorities
    const { provider } = await DataSetBuilder.create().withConfigs().withCountriesAuthorities({ authorityFullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'GM' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'FSCM' }).build();

    const payload: Paths.UpdateStpProviderRules.RequestBody = [
      {
        isEnabled: true,
        stpRules: [{ key: 'allowedProfileStatuses', isEnabled: true, value: ['a', 'b'] }],
        countriesAuthorities: [{ authority: 'CYSEC' }],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'type is required',
      code: 'ERR_CONFLICT',
      meta: { id: { value: ['a', 'b'] } },
    });
  });

  it('Should throw ERR_CONFLICT if only type inside of stpRules was sent', async () => {
    // Seed stp rules and authorities
    await DataSetBuilder.create().withStpRule({ id: '1', key: 'allowedProfileStatuses' }).withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '2', key: 'allowedVaultColors' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '3', key: 'requiredBackgroundChecks' }).withAuthority({ fullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withStpRule({ id: '4', key: 'requiredBackgroundChecks' }).build();
    // Seed provider and bound with new authorities
    const { provider } = await DataSetBuilder.create().withConfigs().withCountriesAuthorities({ authorityFullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'GM' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'FSCM' }).build();

    const payload: Paths.UpdateStpProviderRules.RequestBody = [
      {
        isEnabled: true,
        stpRules: [{ key: 'allowedProfileStatuses', isEnabled: true, type: 'list' }],
        countriesAuthorities: [{ authority: 'CYSEC' }],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'value is required',
      code: 'ERR_CONFLICT',
      meta: { id: { type: 'list' } },
    });
  });

  it('Should throw ERR_CONFLICT if value doesnt follow type', async () => {
    // Seed stp rules and authorities
    await DataSetBuilder.create().withStpRule({ id: '1', key: 'allowedProfileStatuses' }).withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '2', key: 'allowedVaultColors' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '3', key: 'requiredBackgroundChecks' }).withAuthority({ fullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withStpRule({ id: '4', key: 'requiredBackgroundChecks' }).build();
    // Seed provider and bound with new authorities
    const { provider } = await DataSetBuilder.create().withConfigs().withCountriesAuthorities({ authorityFullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'GM' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'FSCM' }).build();

    const payload: Paths.UpdateStpProviderRules.RequestBody = [
      {
        isEnabled: true,
        stpRules: [{ key: 'allowedProfileStatuses', isEnabled: true, type: 'list', value: 'test' }],
        countriesAuthorities: [{ authority: 'CYSEC' }],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, payload);

    expect(statusCode).toBe(409);
    expect(body).toMatchObject({
      message: 'value must be an array',
      code: 'ERR_CONFLICT',
      meta: { id: { key: 'allowedProfileStatuses', type: 'list', value: 'test' } },
    });
  });

  it('Should update stp-rules', async () => {
    // Seed stp rules and authorities
    await DataSetBuilder.create().withStpRule({ id: '1', key: 'allowedProfileStatuses' }).withAuthority({ fullCode: 'GM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '2', key: 'allowedVaultColors' }).withAuthority({ fullCode: 'FSCM' }).build();
    await DataSetBuilder.create().withStpRule({ id: '3', key: 'requiredBackgroundChecks' }).withAuthority({ fullCode: 'CYSEC' }).build();
    // Seed provider and bound with new authorities
    const { provider } = await DataSetBuilder.create().withConfigs().withCountriesAuthorities({ authorityFullCode: 'CYSEC' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'GM' }).build();
    await DataSetBuilder.create().withProviderMethods({ providerId: provider.id }).withCountriesAuthorities({ authorityFullCode: 'FSCM' }).build();

    const payload: Paths.UpdateStpProviderRules.RequestBody = [
      {
        isEnabled: true,
        stpRules: [{ key: 'allowedProfileStatuses', isEnabled: true, type: 'list', value: ['1','2','3','4','5'] }],
        countriesAuthorities: [{ authority: 'CYSEC' }],
      },
      {
        isEnabled: true,
        stpRules: [{ key: 'allowedVaultColors', isEnabled: true }, { key: 'allowedProfileStatuses', isEnabled: true }],
        countriesAuthorities: [{ authority: 'GM' }],
      },
      {
        isEnabled: true,
        stpRules: [{ key: 'requiredBackgroundChecks', isEnabled: true, type: 'number', value: '12345' }],
        countriesAuthorities: [{ authority: 'FSCM' }],
      },
    ];

    const { statusCode, body } = await sendRequest(provider.code, payload);
    const stpProviderRulesDB = await dbSelect(DbTable.cpStpProviderRules, {});

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual(payload);
    expect(stpProviderRulesDB).toHaveLength(3);
  });
});
