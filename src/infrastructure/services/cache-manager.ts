import { IRedisConfig } from '@internal/core-library';
import { ILogger } from '@internal/logger-library';
import { CacheConfig } from '@core/contracts/infrastructure';

import { RedisDataSource } from '../providers';

export interface CacheManagerOptions {
  config: CacheConfig;
  redisDataSource: RedisDataSource;
  redisConfig: IRedisConfig;
  logger: ILogger;
}

export interface BaseCacheParams {
  serviceName: string;
  methodName: string;
  args: unknown[];
}

interface AddToCacheParams extends BaseCacheParams {
  value: unknown;
}

export class CacheManager {
  readonly #redisDataSource: RedisDataSource;
  readonly #config: CacheConfig;
  readonly #logger: ILogger;

  constructor(options: CacheManagerOptions) {
    this.#config = options.config;
    this.#logger = options.logger;
    this.#redisDataSource = options.redisDataSource;
  }

  public isEnabled(): boolean {
    return this.#config?.enabled || false;
  }

  public async get<T = unknown>(params: BaseCacheParams): Promise<T | null> {
    const key = this.buildKey(params);

    const value = await this.#redisDataSource.getDataSource().get(key);

    return value ? JSON.parse(value) as T : null;
  }

  public async addToCache(params: AddToCacheParams): Promise<void> {
    const { value, ...baseCacheParams } = params;

    const key = this.buildKey(baseCacheParams);

    await this.#redisDataSource.getDataSource().set(key, JSON.stringify(value), 'EX', this.#config.ttlSeconds);
  }

  public async invalidate(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }
    const redis = this.#redisDataSource.getDataSource();

    const keys = await redis.keys(`${this.#config.redisKeyPrefix}:*`);

    if (!keys.length) {
      this.#logger.info(`Nothing to invalidate`);
      return;
    }

    await redis.del(...keys);
    this.#logger.info(`Cache invalidated. ${keys.length} keys invalidated.`);
  }

  private buildKey(params: BaseCacheParams): string {
    return `${this.#config.redisKeyPrefix}:${params.serviceName}:${params.methodName}:${JSON.stringify(params.args)}`;
  }
}
