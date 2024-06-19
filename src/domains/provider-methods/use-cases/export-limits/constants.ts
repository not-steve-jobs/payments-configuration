import { ProviderMethodLimitStats } from '@core';

export const BUILD_NEW_FILE_NAME = (): string => `cp_export_limits_${Date.now()}.csv`;

export const STATS_FIELDS_ORDERED = {
  countryName: 'Country Name',
  countryIso3: 'Country Alpha 3 Code',
  authorityFullCode: 'Jurisdiction',
  methodName: 'Type',
  providerCode: 'Integrator / Method',
  configsType: 'TX Type',
  configsCurrencyIso3: 'Currency',
  configsMinAmount: 'Min',
  configsMaxAmount: 'Max',
  configsIsEnabled: 'Enabled',
  configsPeriod: 'Period',
  depositsOrder: 'Deposit order',
  configsUpdatedAt: 'Applied date',
} as Record<keyof ProviderMethodLimitStats, string>;
