import { ErrorCode } from '@internal/component-test-library/lib/src/constants';

export function validateInvalidCountryLengthResponse(statusCode: number, body: Record<string, unknown>): void {
  expect(statusCode).toBe(400);
  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      // eslint-disable-next-line max-len
      details: `[{"message":"must NOT have more than 2 characters","path":"/query/country","value":null},{"message":"must match pattern \\\"^[A-Za-z]{2}$\\\"","path":"/query/country","value":null}]`,
    },
    requestId: expect.toBeGUID(),
  });
}

export function validateMandatoryParameterResponse(
  parameter: string,
  path: 'query' | 'body' | string,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);
  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: `[{"message":"must have required property '${parameter}'","path":"/${path}/${parameter}","value":null}]`,
    },
    requestId: expect.toBeGUID(),
  });
}

export function validateMustNotHaveAdditionalProperties(
  parameter: string,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);
  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: `[{"message":"must NOT have additional properties","path":"/body/${parameter}","value":null}]`,
    },
    requestId: expect.toBeGUID(),
  });
}

export function validateMustNotHaveFewerItemsThan(
  /**
   * Property path
   */
  parameter: string,
  length: number,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);
  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: `[{"message":"must NOT have fewer than ${length} items","path":"/body/${parameter}","value":null}]`,
    },
    requestId: expect.toBeGUID(),
  });
}

export function validateMustNotHaveFewerPropertiesThan(
  parameter: string,
  length: number,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);
  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: `[{"message":"must NOT have fewer than ${length} properties","path":"/body/${parameter}","value":null}]`,
    },
    requestId: expect.toBeGUID(),
  });
}

export function validateNotFoundError(
  message: string,
  id: object | string,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(404);
  expect(body).toMatchObject({
    code: ErrorCode.ERR_NOT_FOUND,
    message,
    meta: { id },
    requestId: expect.toBeGUID(),
  });
}

export function parseValidationDetails(
  meta: Record<string, unknown>
): Array<{ message: string; path: string; value: unknown }> {
  if (typeof meta !== 'object') {
    throw new Error(`Meta should be of type object, received "${meta}"`);
  }

  if (!meta.details || typeof meta.details !== 'string') {
    throw new Error(`Meta should be of object with details property`);
  }

  const details = JSON.parse(meta.details);

  return details;
}

export function validateMustBeType(
  parameter: string,
  type: 'string' | 'number' | 'boolean',
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);

  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: expect.any(String),
    },
    requestId: expect.toBeGUID(),
  });

  const messageDetails = parseValidationDetails((body as { meta: { details: string } }).meta);

  expect(messageDetails).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: `must be ${type}`,
        path: parameter,
        value: null,
      }),
    ])
  );
}

export function validateShouldMatchRegexp(
  parameter: string,
  regexp: string,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);

  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: expect.any(String),
    },
    requestId: expect.toBeGUID(),
  });

  const messageDetails = parseValidationDetails((body as { meta: { details: string } }).meta);

  expect(messageDetails).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: `must match pattern \"${regexp}\"`,
        path: parameter,
        value: null,
      }),
    ])
  );
}

export function validateStringMaxLength(
  parameter: string,
  maxLength: number,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);

  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: expect.any(String),
    },
    requestId: expect.toBeGUID(),
  });

  const messageDetails = parseValidationDetails((body as { meta: { details: string } }).meta);

  expect(messageDetails).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: `must NOT have more than ${maxLength} characters`,
        path: parameter,
        value: null,
      }),
    ])
  );
}

export function validateStringMinLength(
  parameter: string,
  minLength: number,
  statusCode: number,
  body: Record<string, unknown>
): void {
  expect(statusCode).toBe(400);

  expect(body).toMatchObject({
    code: ErrorCode.ERR_VALIDATION_REQUEST,
    message: 'Bad Request',
    meta: {
      details: expect.any(String),
    },
    requestId: expect.toBeGUID(),
  });

  const messageDetails = parseValidationDetails((body as { meta: { details: string } }).meta);

  expect(messageDetails).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: `must NOT have fewer than ${minLength} characters`,
        path: parameter,
        value: null,
      }),
    ])
  );
}
