import { BaseError, LogLevel } from '@internal/errors-library';


export class MaxAllowedMethodsExceededError extends BaseError {
  public readonly logLevel = LogLevel.WARNING;
  public static readonly code = 'ERR_MAX_ALLOWED_METHODS_EXCEEDED';

  constructor() {
    super(`Exceeded maximum allowed methods`, {
      status: 409,
    });
  }
}
