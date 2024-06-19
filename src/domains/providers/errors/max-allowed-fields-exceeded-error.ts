import { BaseError, LogLevel } from '@internal/errors-library';


export class MaxAllowedFieldsExceededError extends BaseError {
  public readonly logLevel = LogLevel.WARNING;
  public static readonly code = 'ERR_MAX_ALLOWED_FIELDS_EXCEEDED';

  constructor() {
    super(`Exceeded maximum allowed fields`, { status: 409 });
  }
}
