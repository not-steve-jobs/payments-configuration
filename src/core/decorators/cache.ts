import { BaseCacheParams, CacheManager } from '@infra/services/cache-manager';
import { ILogger } from '@internal/logger-library';

export interface Cacheable {
  cacheManager?: CacheManager;
  logger?: ILogger;
}

export function Cache<T extends Cacheable>(): (
  target: T,
  key: string,
  descriptor: PropertyDescriptor,
) => PropertyDescriptor {
  return function(
    target: T,
    key: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: unknown[]): Promise<unknown> {
      const self = this as T;

      if (!self.cacheManager?.isEnabled()) {
        return await originalMethod.apply(this, args);
      }

      const params: BaseCacheParams = { serviceName: self.constructor.name, methodName: key, args };

      let value = await self.cacheManager.get(params);
      if (value) {
        self.logger?.info(`[${self.constructor.name}] ${key} retrieved from cache with arguments: ${JSON.stringify(args)}`);
      } else {
        value = await originalMethod.apply(this, args);
        await self.cacheManager.addToCache({ ...params, value });
      }

      return value;
    };

    return descriptor;
  };
}
