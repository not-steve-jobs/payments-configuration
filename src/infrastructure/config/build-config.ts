import path from 'path';

import { loadConfig } from '@internal/core-library';
import { PaymentsConfigurationManagementServiceConfig } from '@core/contracts/infrastructure';

export function buildConfig(appRoot: string, configName?: string): PaymentsConfigurationManagementServiceConfig {
  const configDir = path.join(appRoot, 'config');

  return loadConfig(configDir, configName);
}
