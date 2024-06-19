import { BaseError, LogLevel } from '@internal/errors-library';

export enum CredentialsOverlapErrorCode {
  PARAMETERS_OVERLAP = 'ERR_PARAMETERS_OVERLAP',
  CREDENTIALS_OVERLAP = 'ERR_CREDENTIALS_OVERLAP'
}

export interface CredentialsOverlapErrorParams {
  code: CredentialsOverlapErrorCode;
  message: string;
}

export class CredentialsOverlapError extends BaseError {
  public readonly logLevel = LogLevel.WARNING;

  constructor({ code, message }: CredentialsOverlapErrorParams) {
    super(`${message} Please ensure unique combinations for rules and keys before updating.`, {
      status: 409,
      code,
    });
  }
}
