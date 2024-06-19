import path from 'path';
import { AwilixContainer } from 'awilix';
import { Server } from 'http';

import start from '@internal/core-library';
import { PaymentsConfigurationManagementServiceConfig } from '@core';
import { LoggerDecorator } from '@internal/logger-library';

import { composeApi } from './api';

export const startServer = (container: AwilixContainer): Promise<Server> => {
  const logger = container.resolve<LoggerDecorator>('logger');
  const config = container.resolve<PaymentsConfigurationManagementServiceConfig>('config');
  const composeRoutes = composeApi(container);

  return start({
    appRoot: path.join(__dirname, '../.'),
    cg: {
      server: { composeRoutes },
      config,
      logger,
    },
  });
};
