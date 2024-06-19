import cors from 'cors';
import passport from 'passport';
import { AwilixContainer } from 'awilix';
import { Router } from 'express';

import { TSetupRoutes } from '@internal/core-library';
import { PaymentsConfigurationManagementServiceConfig } from '@core';

import { invalidateCacheMiddleware } from './middlewares';
import { buildAzureAdStrategy } from './strategies';

export const composeApi = (container: AwilixContainer): TSetupRoutes => {
  const config = container.resolve<PaymentsConfigurationManagementServiceConfig>('config');

  const router = Router();

  router.use(cors());
  router.use(passport.initialize());
  if (config.auth) {
    const authMiddleware = buildAzureAdStrategy(config.auth);

    passport.use(authMiddleware);
  }
  router.use((req, res, next) => {
    req.container = container.createScope();
    next();
  });
  router.use(invalidateCacheMiddleware);

  return () => [{ router }];
};

