/* eslint-disable ordered-imports/ordered-imports */
import '@internal/telemetry-library/lib/init-otel-agent-mw';

import path from 'path';

import { buildConfig, buildLogger } from '@infra';
import { getArgv } from '@infra/helpers';
import { IAppCreateResponse } from '@internal/core-library';

import { createAppContainer } from './container';
import { startServer } from './start-server';

async function bootstrap(): Promise<IAppCreateResponse> {
  const configName = getArgv(process.argv, 'config', 'env.properties');
  const appRoot = path.join(__dirname, '..');

  const config = buildConfig(appRoot, configName);
  const logger = await buildLogger(appRoot, config);
  const container = createAppContainer({
    config,
    logger,
  });

  return startServer(container);
}

// eslint-disable-next-line no-console
bootstrap().catch(err => console.error('Application failed with', err));
