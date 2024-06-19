import { AwilixContainer, Constructor, asClass } from 'awilix';

import { UseCase } from '@core';

import * as services from './use-cases';
import { ConfigUpsertCleaner, ConfigUpsertProcessor, FieldsService } from './services';
import { GetProviderFieldsService, GetProviderFieldsServiceV1, GetProviderFieldsServiceV2 } from './use-cases/get-provider-fields-service';
import { UpsertProviderFieldsService, UpsertProviderFieldsServiceV1, UpsertProviderFieldsServiceV2 } from './use-cases/upsert-provider-fields-service';

export default function registerProvidersModule(container: AwilixContainer): void {
  const useNewFieldsSchema = container.resolve('config').features?.useNewFieldsSchema ?? false;

  Object.values(services).forEach(Service => {
    container.register(Service.name, asClass(Service as Constructor<UseCase<unknown, unknown>>));
  });

  container.register({
    fieldsService: asClass(FieldsService),
    configUpsertProcessor: asClass(ConfigUpsertProcessor),
    configUpsertCleaner: asClass(ConfigUpsertCleaner),
    GetProviderFieldsService: asClass<GetProviderFieldsService>(useNewFieldsSchema ? GetProviderFieldsServiceV2 : GetProviderFieldsServiceV1),
    UpsertProviderFieldsService: asClass<UpsertProviderFieldsService>(useNewFieldsSchema ? UpsertProviderFieldsServiceV2 : UpsertProviderFieldsServiceV1),
  });
};
