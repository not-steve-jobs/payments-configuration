import { AwilixContainer, Constructor, asClass } from 'awilix';

import * as useCases from '@domains/provider-methods/use-cases';
import { UseCase } from '@core';

export default function registerProviderMethodsModule(container: AwilixContainer): void {
  Object.values(useCases).forEach(useCase => {
    container.register<UseCase<unknown, unknown>>(useCase.name, asClass(useCase as Constructor<UseCase<unknown, unknown>>));
  });
};
