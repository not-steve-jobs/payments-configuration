import { AwilixContainer, Constructor, asClass } from 'awilix';

import { UseCase } from '@core';

import * as services from './use-cases';

export default function registerCountriesAuthoritiesModule(container: AwilixContainer): void {
  Object.values(services).forEach(Service => {
    container.register(Service.name, asClass(Service as Constructor<UseCase<unknown, unknown>>));
  });
};
