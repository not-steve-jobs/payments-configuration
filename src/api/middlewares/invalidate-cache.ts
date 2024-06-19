import { NextFunction, Request, Response } from 'express';

import { CacheManager } from '@infra/services';

export const invalidateCacheMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method !== 'GET') {
    const cacheManager = req.container.resolve<CacheManager>('cacheManager');

    cacheManager.invalidate();
  }

  next();
};
