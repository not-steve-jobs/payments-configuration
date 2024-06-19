import { AwilixContainer, Constructor, asClass } from 'awilix';

import { UseCase } from '@core/use-case';

import * as services from './use-cases';

export default function registerCurrenciesModule(container: AwilixContainer): void {
  Object.values(services).forEach(Service => {
    container.register(Service.name, asClass(Service as Constructor<UseCase<unknown, unknown>>));
  });
};
