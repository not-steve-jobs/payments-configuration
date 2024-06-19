import { BaseError, LogLevel } from '@internal/errors-library';


export class MaxAllowedCurrenciesExceededError extends BaseError {
  public readonly logLevel = LogLevel.WARNING;
  public static readonly code = 'ERR_MAX_ALLOWED_CURRENCIES_EXCEEDED';
  private readonly limit: number;
  private readonly received: number;

  constructor(received: number, limit: number) {
    super(`Exceeded maximum allowed currencies`, { status: 409 });
    this.received = received;
    this.limit = limit;
  }

  protected getMetaData(): object | undefined {
    return { limit: this.limit, received: this.received };
  }
}
