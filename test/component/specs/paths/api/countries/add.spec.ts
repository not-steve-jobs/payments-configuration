import request from 'supertest';

import {
  cleanUp,
  validateMandatoryParameterResponse,
  validateMustBeType,
  validateShouldMatchRegexp,
  validateStringMaxLength,
  validateStringMinLength,
} from '@test-component/utils';
import { DataSetBuilder } from '@test-component/data';
import { Paths } from '@typings/openapi';
import { ErrorCode } from '@internal/component-test-library';

describe('PUT /api/countries', () => {
  const sendRequest = (data: object): request.Test =>
    request(baseUrl).put(`api/countries`).withAuth().send(data);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should create and return country when new data provided', async () => {
    const data: Paths.AddCountry.RequestBody = {
      iso2: 'CY',
      iso3: 'CYP',
      name: 'Cyprus',
      group: 'Eurozone',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      iso2: data.iso2,
      iso3: data.iso3,
      name: data.name,
      group: data.group,
    });
  });

  it('Should update when with with same iso2 already exists', async () => {
    const { country } = await DataSetBuilder.create().withCountry().build();

    const data: Paths.AddCountry.RequestBody = {
      iso2: country.iso2,
      iso3: 'CYP',
      name: `${country.name}-modified`,
      // Max length - 30
      group: `${country.group.slice(0, 10)}-modified`,
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(200);

    expect(body).toStrictEqual({
      iso2: data.iso2,
      iso3: data.iso3,
      name: data.name,
      group: data.group,
    });
  });

  const mustByString = (parameter: string) => (statusCode: number, body: Record<string, unknown>) => {
    validateMustBeType(parameter, 'string', statusCode, body);
  };

  const matchRegexp = (parameter: string, regexp: string) => (statusCode: number, body: Record<string, unknown>) => {
    validateShouldMatchRegexp(parameter, regexp, statusCode, body);
  };

  const maxLength = (parameter: string, length: number) => (statusCode: number, body: Record<string, unknown>) => {
    validateStringMaxLength(parameter, length, statusCode, body);
  };

  const minLength = (parameter: string, length: number) => (statusCode: number, body: Record<string, unknown>) => {
    validateStringMinLength(parameter, length, statusCode, body);
  };

  it.each([
    { iso2: 123, validators: [mustByString('/body/iso2')] },
    { iso2: true, validators: [mustByString('/body/iso2')] },
    { iso2: 'CYA', validators: [matchRegexp('/body/iso2', '^[A-Z]{2}$'), maxLength('/body/iso2', 2)] },
    { iso2: 'A1', validators: [matchRegexp('/body/iso2', '^[A-Z]{2}$')] },
    { iso2: 'A', validators: [matchRegexp('/body/iso2', '^[A-Z]{2}$'), minLength('/body/iso2', 2)] },
  ])('should throw validation error when iso2 format is incorrect', async ({ iso2, validators }) => {
    const data: Omit<Paths.AddCountry.RequestBody, 'iso2'> & { iso2: unknown } = {
      iso2,
      iso3: 'CYP',
      name: 'Cyprus',
      group: 'Eurozone',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(400);

    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: expect.any(String),
      },
      requestId: expect.toBeGUID(),
    });

    validators.forEach(validator => validator(statusCode, body));
  });

  it.each([
    { iso3: 123, validators: [mustByString('/body/iso3')] },
    { iso3: true, validators: [mustByString('/body/iso3')] },
    { iso3: 'CYAA', validators: [matchRegexp('/body/iso3', '^[A-Z]{3}$'), maxLength('/body/iso3', 3)] },
    { iso3: 'A1', validators: [matchRegexp('/body/iso3', '^[A-Z]{3}$')] },
    { iso3: 'A', validators: [matchRegexp('/body/iso3', '^[A-Z]{3}$'), minLength('/body/iso3', 3)] },
  ])('should throw validation error when iso3 format is incorrect', async ({ iso3, validators }) => {
    const data: Omit<Paths.AddCountry.RequestBody, 'iso3'> & { iso3: unknown } = {
      iso2: 'CY',
      iso3,
      name: 'Cyprus',
      group: 'Eurozone',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(400);

    expect(body).toMatchObject({
      code: ErrorCode.ERR_VALIDATION_REQUEST,
      message: 'Bad Request',
      meta: {
        details: expect.any(String),
      },
      requestId: expect.toBeGUID(),
    });

    validators.forEach(validator => validator(statusCode, body));
  });

  it.each(['iso2', 'iso3', 'name'])(
    'should throw validation error when some of required parameters was not provided',
    async nullKey => {
      const data: Partial<Paths.AddCountry.RequestBody> = {
        iso2: 'CY',
        iso3: 'CYP',
        name: 'Cyprus',
        group: 'Eurozone',
        [nullKey]: undefined,
      };

      const { statusCode, body } = await sendRequest(data);

      expect(statusCode).toBe(400);

      expect(body).toMatchObject({
        code: ErrorCode.ERR_VALIDATION_REQUEST,
        message: 'Bad Request',
        meta: {
          details: expect.any(String),
        },
        requestId: expect.toBeGUID(),
      });

      validateMandatoryParameterResponse(nullKey, 'body', statusCode, body);
    }
  );

  it('Should create new Country if provided empty group', async () => {
    const data: Partial<Paths.AddCountry.RequestBody> = {
      iso2: 'CY',
      iso3: 'CYP',
      name: 'Cyprus',
      group: '',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(200);

    expect(body).toStrictEqual({
      iso2: data.iso2,
      iso3: data.iso3,
      name: data.name,
      group: data.group,
    });
  });

  it('Should create new Country if provided group is empty spaces', async () => {
    const data: Partial<Paths.AddCountry.RequestBody> = {
      iso2: 'CY',
      iso3: 'CYP',
      name: 'Cyprus',
      group: '   ',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(200);

    expect(body).toStrictEqual({
      iso2: data.iso2,
      iso3: data.iso3,
      name: data.name,
      group: '',
    });
  });

  it('Should not create new Country if provided name is empty spaces', async () => {
    const data: Partial<Paths.AddCountry.RequestBody> = {
      iso2: 'CY',
      iso3: 'CYP',
      name: '     ',
      group: '',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(400);

    expect(body).toMatchObject({
      message: "name can't be empty",
      code: 'ERR_BAD_REQUEST',
    });
  });

  it('Should create new Country with trimmed name and group', async () => {
    const data: Partial<Paths.AddCountry.RequestBody> = {
      iso2: 'CY',
      iso3: 'CYP',
      name: '  Cypurus ',
      group: ' EUA ',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(200);

    expect(body).toStrictEqual({
      iso2: data.iso2,
      iso3: data.iso3,
      name: data.name?.trim(),
      group: data.group?.trim(),
    });
  });

  it('Should create new Country if not send group', async () => {
    const data: Partial<Paths.AddCountry.RequestBody> = {
      iso2: 'CY',
      iso3: 'CYP',
      name: 'Cyprus',
    };

    const { statusCode, body } = await sendRequest(data);

    expect(statusCode).toBe(200);

    expect(body).toStrictEqual({
      iso2: data.iso2,
      iso3: data.iso3,
      name: data.name,
      group: '',
    });
  });

  it('Should throw conflict error when provided already exist iso3', async () => {
    const data: Partial<Paths.AddCountry.RequestBody> = {
      iso2: 'CY',
      iso3: 'CYP',
      name: 'Cyprus',
    };

    await sendRequest(data);

    const { statusCode, body } = await sendRequest({
      iso2: 'AM',
      iso3: data.iso3,
      name: 'Armenia',
    });

    expect(statusCode).toBe(422);

    expect(body).toMatchObject({
      code: 'ERR_VALIDATION',
      message: `country with iso3: ${data.iso3} already exist`,
      requestId: expect.toBeGUID(),
    });
  });

  it('Should throw conflict error when provided already exist name', async () => {
    const data: Partial<Paths.AddCountry.RequestBody> = {
      iso2: 'CY',
      iso3: 'CYP',
      name: 'Cyprus',
    };

    await sendRequest(data);

    const { statusCode, body } = await sendRequest({
      iso2: 'AM',
      iso3: 'ARM',
      name: data.name,
    });

    expect(statusCode).toBe(422);

    expect(body).toMatchObject({
      code: 'ERR_VALIDATION',
      message: `country with name: ${data.name} already exist`,
      requestId: expect.toBeGUID(),
    });
  });

  it.each([
    {
      country1: { iso2: 'AK', iso3: 'APK', name: 'London' },
      country2: {
        iso2: 'AL',
        iso3: 'ALK',
        name: 'Washington',
      },
      update: {
        iso2: 'AK',
        name: 'London',
        iso3: 'ALK',
      },
      message: `country with iso3: ALK already exist`,
    },
    {
      country1: { iso2: 'AJ', iso3: 'AJK', name: 'Lisbon' },
      country2: {
        iso2: 'AG',
        iso3: 'AGK',
        name: 'Yerevan',
      },
      update: {
        iso2: 'AJ',
        name: 'Yerevan',
        iso3: 'AJK',
      },
      message: `country with name: Yerevan already exist`,
    },
  ])(
    'Should throw conflict error when provided already exist iso3 and/or name',
    async ({ country1, country2, update, message }) => {
      const data: Partial<Paths.AddCountry.RequestBody> = update;

      await DataSetBuilder.create().withCountry(country1).build();

      await DataSetBuilder.create().withCountry(country2).build();

      const { statusCode, body } = await sendRequest(data);

      expect(statusCode).toBe(422);

      expect(body).toMatchObject({
        code: 'ERR_VALIDATION',
        message,
        requestId: expect.toBeGUID(),
      });
    }
  );
});
