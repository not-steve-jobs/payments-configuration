/* eslint-disable @typescript-eslint/no-var-requires */
import { AwilixContainer, asClass, asValue, createContainer } from 'awilix';

import { ExternalRequestApi, FaultTolerantRequestApi, RequestApi } from '@internal/request-library';
import { Cacher, RedisCacheStorage } from '@internal/cache-library';
import { RedisApi } from '@internal/redis-client';
import { LoggerDecorator } from '@internal/logger-library';
import { BitbucketSdk, CacheManager, PaymentGatewayService } from '@infra/services';

import registerCountriesAuthoritiesMethodsModule from './domains/countries-authorities-methods/module';
import registerCountriesAuthoritiesModule from './domains/countries-authorities/module';
import registerCurrenciesModule from './domains/currencies/module';
import registerInteropModule from './domains/interop/module';
import registerMobilePlatformsModule from './domains/mobile-platforms/module';
import registerProviderMethodsModule from './domains/provider-methods/module';
import registerProvidersModule from './domains/providers/module';
import registerStpRulesModule from './domains/stp-rules/module';
import * as contracts from './core/contracts';
import * as infra from './infrastructure';
import { disposer } from './utils';

export interface ExternalDependencies {
  config: contracts.PaymentsConfigurationManagementServiceConfig;
  logger: LoggerDecorator;
}

export const createAppContainer = (externalDependencies: ExternalDependencies): AwilixContainer => {
  const container = createContainer({
    injectionMode: 'PROXY',
  });

  Object.entries(externalDependencies).forEach(([key, value]) => {
    container.register(key, asValue(value));
  });

  container.register({
    dataSource: asClass(infra.MariaDBDataSource).singleton(),
    redisDataSource: asClass(infra.RedisDataSource).inject(c => ({
      config: c.resolve<contracts.PaymentsConfigurationManagementServiceConfig>('config').redis,
    })).singleton(),
    countryRepository: asClass(infra.CountryRepository),
    authorityRepository: asClass(infra.AuthorityRepository),
    methodRepository: asClass(infra.MethodRepository),
    countryAuthorityRepository: asClass(infra.CountryAuthorityRepository),
    countryAuthorityMethodRepository: asClass(infra.CountryAuthorityMethodRepository),
    providerRepository: asClass(infra.ProviderRepository),
    providerMethodRepository: asClass(infra.ProviderMethodRepository),
    providerMethodTransactionConfigRepository: asClass(infra.TransactionConfigRepository),
    currencyRepository: asClass(infra.CurrencyRepository),
    transactionConfigRepository: asClass(infra.TransactionConfigRepository),
    fieldRepository: asClass(infra.FieldRepository),
    fieldOptionRepository: asClass(infra.FieldOptionRepository),
    platformsRepository: asClass(infra.PlatformsRepository),
    credentialsRepository: asClass(infra.CredentialsRepository),
    providerRestrictionsRepository: asClass(infra.ProviderRestrictionsRepository),
    providerFieldRepository: asClass(infra.ProviderFieldRepository),
    bankAccountsRepository: asClass(infra.BankAccountsRepository),
    stpRuleRepository: asClass(infra.StpRuleRepository),
    stpProviderRuleRepository: asClass(infra.StpProviderRuleRepository),
  });

  registerCountriesAuthoritiesMethodsModule(container);
  registerCurrenciesModule(container);
  registerProvidersModule(container);
  registerInteropModule(container);
  registerMobilePlatformsModule(container);
  registerStpRulesModule(container);
  registerCountriesAuthoritiesModule(container);
  registerProviderMethodsModule(container);

  container.register({
    androidBitbucketSdk: asClass(BitbucketSdk).inject(c => {
      const directConfig = c.resolve<contracts.PaymentsConfigurationManagementServiceConfig>('config').direct;
      return {
        workspace: directConfig.mobileapp.bitbucket.workspace,
        projectName: directConfig.mobileapp.bitbucket.android.project,
        accessToken: directConfig.mobileapp.bitbucket.android.key,
      };
    }),
    iosBitbucketSdk: asClass(BitbucketSdk).inject(c => {
      const directConfig = c.resolve<contracts.PaymentsConfigurationManagementServiceConfig>('config').direct;
      return {
        workspace: directConfig.mobileapp.bitbucket.workspace,
        projectName: directConfig.mobileapp.bitbucket.ios.project,
        accessToken: directConfig.mobileapp.bitbucket.ios.key,
      };
    }),
  });

  container.register({
    cacher: asClass(Cacher).inject(c => ({
      cacheConfig: c.resolve<contracts.PaymentsConfigurationManagementServiceConfig>('config').cache,
    })),
    cacheStorage: asClass(RedisCacheStorage),
    redisApi: asClass(RedisApi)
      .inject(c => ({ config: c.resolve<contracts.PaymentsConfigurationManagementServiceConfig>('config').redis }))
      .disposer(disposer)
      .singleton(),
    requestApi: asClass(RequestApi).inject(c => ({
      externalRequestApi: new ExternalRequestApi({
        logger: c.resolve('logger'),
        cacher: c.resolve('cacher'),
      }),
    })),
    faultTolerantRequestApi: asClass(FaultTolerantRequestApi).inject(c => ({
      httpRequestApi: c.resolve('requestApi'),
    })),
    paymentGatewayService: asClass(PaymentGatewayService).inject(c => ({
      config: c.resolve<contracts.PaymentsConfigurationManagementServiceConfig>('config').paymentGateway,
    })),
    cacheManager: asClass(CacheManager).inject(c => ({
      config: c.resolve<contracts.PaymentsConfigurationManagementServiceConfig>('config').cache,
    })),
  });

  return container;
};

