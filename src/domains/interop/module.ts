import { AwilixContainer, Constructor, asClass } from 'awilix';

import { UseCase } from '@core';

import * as useCases from './use-cases';
import { PlatformVersionsRestrictionsService } from './services';
import {
  GetConfigsService,
  GetConfigsServiceV1,
  GetConfigsServiceV2, GetDepositConfigs,
  GetDepositConfigsService, GetDepositConfigsV2,
} from './use-cases';

export default (container: AwilixContainer): void => {
  const useNewFieldsSchema = container.resolve('config').features?.useNewFieldsSchema ?? false;

  container.register({
    platformVersionsRestrictionsService: asClass(PlatformVersionsRestrictionsService),
  });

  Object.values(useCases).forEach(Service => {
    container.register(Service.name, asClass(Service as Constructor<UseCase<unknown, unknown>>));
  });

  container.register({
    GetDepositConfigs: asClass<GetDepositConfigs>(useNewFieldsSchema ? GetDepositConfigsV2 : GetDepositConfigsService),
    GetConfigsService: asClass<GetConfigsService>(useNewFieldsSchema ? GetConfigsServiceV2 : GetConfigsServiceV1),
  });
};
