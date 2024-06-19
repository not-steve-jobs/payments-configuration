export enum Authority {
  MENA = 'mena',
  GM = 'gm',
  FCA = 'fca',
  CYSEC = 'cysec',
  CBB = 'cbb',
  CBC = 'cbc',
  FSCM = 'fscm',
  FSAS = 'fsas'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  REFUND = 'refund',
  PAYOUT = 'payout',
}

export enum FieldValueType {
  BOOL = 'bool',
  STRING = 'string',
  SELECT = 'select',
}

export enum FieldEntityType {
  PROVIDER_METHOD = 'providerMethod',
  PROVIDER = 'provider',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ApplicationPlatforms {
  ANDROID = 'android',
  IOS = 'ios',
  WEB = 'web'
}

export enum ProviderType {
  DEFAULT = 'default',
  CRYPTO = 'crypto',
  BANKWIRE = 'bankwire'
}
