import Redis from 'ioredis';

import { IRedisConfig } from '@internal/core-library';
import { DataSource } from '@core';

export interface RedisDataSourceOptions {
  config: IRedisConfig;
}

export class RedisDataSource implements DataSource<Redis> {
  readonly #config: IRedisConfig;
  #redis: Redis | null = null;

  constructor(options: RedisDataSourceOptions) {
    this.#config = options.config;
  }

  public getDataSource(): Redis {
    if (!this.#redis) {
      this.#redis = new Redis({
        host: this.#config.server.host,
        password: this.#config.server.password,
        port: this.#config.server.port,
      });
    }

    return this.#redis;
  }
}
