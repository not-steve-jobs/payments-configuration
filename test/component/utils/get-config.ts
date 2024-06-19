import { buildConfig } from '@infra/config';
import { PaymentsConfigurationManagementServiceConfig } from '@core';

export const getConfig = (): PaymentsConfigurationManagementServiceConfig =>
  buildConfig(process.env.PWD!, process.env.ENV_PROPERTIES!);
