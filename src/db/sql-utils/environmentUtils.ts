
import path from 'path';

import { PaymentsConfigurationManagementServiceConfig } from '@core';

import { buildConfig } from '../../infrastructure/config/build-config';
import { getArgv } from '../../infrastructure/helpers';


function loadConfig(): PaymentsConfigurationManagementServiceConfig {
  const configName = getArgv(process.argv, 'config', String(process.env.ENV_PROPERTIES));
  const appRoot = path.join(__dirname, '../../..');

  return buildConfig(appRoot, configName);
}

function parsePlant(config: PaymentsConfigurationManagementServiceConfig): string {
  if (!config.plant) {
    throw new Error('Cannot find plant environment variable. Please provide it.');
  }

  return config.plant.toLowerCase().trim();
}

function parseEnv(config: PaymentsConfigurationManagementServiceConfig): string {
  if (!config.env) {
    throw new Error('Cannot find env environment variable. Please provide it.');
  }

  return config.env.toLowerCase().trim();
}

export function isQaPlantOrMockEnvironment(): boolean {
  const config = loadConfig();


  const plant = parsePlant(config);

  if (isPlant(plant, ['qa'])) {
    return true;
  }

  const env = parseEnv(config);
  return isMockEnv(env);
}

export function isDevPlantLocalEnvironment(): boolean {
  const config = loadConfig();
  const plant = parsePlant(config);
  const env = parseEnv(config);

  return isPlant(plant, ['dev']) && env === 'local';
}

function isPlant(plant: string, plants: string[]): boolean {
  if (!plant) {
    throw new Error('Cannot find plant environment variable. Please provide it.');
  }

  if (plants.includes(plant)) {
    console.log(`We are on '${plant}', so we are running the operation.`);
    return true;
  }

  console.log(`We are on '${plant}', so we are skipping the operation.`);
  return false;
}

function isMockEnv(env: string): boolean {
  if (!env) {
    throw new Error('Cannot find env environment variable. Please provide it.');
  }

  if (env.startsWith('mock')) {
    console.log(`We are on a mock environment '${env}', so we are running the operation.`);
    return true;
  }

  console.log(`We are on environment '${env}', so we are skipping the operation.`);
  return false;
}
