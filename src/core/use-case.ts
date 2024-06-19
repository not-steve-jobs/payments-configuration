import { ILogger } from '@internal/logger-library';

import { CacheManager } from '../infrastructure';

import { Cacheable } from './decorators';

export interface UseCaseOptions {
  cacheManager: CacheManager;
  logger: ILogger;
}

export abstract class UseCase<T, U> implements Cacheable {
  public readonly cacheManager: CacheManager;
  public readonly logger: ILogger;

  constructor(options: object) {
    const optionsLikeUseCaseOptions = options as UseCaseOptions;

    this.cacheManager = optionsLikeUseCaseOptions.cacheManager;
    this.logger = optionsLikeUseCaseOptions.logger;
  }

  public abstract execute(payload: T): Promise<U>
}
