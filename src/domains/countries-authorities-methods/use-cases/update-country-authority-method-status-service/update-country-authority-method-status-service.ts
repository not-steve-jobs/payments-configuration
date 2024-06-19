import { CountryAuthorityMethodRepository, CountryAuthorityRepository } from '@infra';
import { CountryAuthorityMethodEntity, UseCase } from '@core';

import { UpdateCountryAuthorityMethodStatusResponse, UpdateCountryAuthorityMethodStatusServiceParams } from './types';

export interface UpdateCountryAuthorityMethodStatusServiceOptions {
  countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
}

export class UpdateCountryAuthorityMethodStatusService extends UseCase<
  UpdateCountryAuthorityMethodStatusServiceParams,
  UpdateCountryAuthorityMethodStatusResponse
> {
  private readonly countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  private readonly countryAuthorityRepository: CountryAuthorityRepository;

  constructor(options: UpdateCountryAuthorityMethodStatusServiceOptions) {
    super(options);
    this.countryAuthorityMethodRepository = options.countryAuthorityMethodRepository;
    this.countryAuthorityRepository = options.countryAuthorityRepository;
  }

  public async execute(payload: UpdateCountryAuthorityMethodStatusServiceParams): Promise<UpdateCountryAuthorityMethodStatusResponse> {
    const countryAuthority = await this.countryAuthorityRepository.findOneOrThrow(payload.authority, payload.country);

    const method: CountryAuthorityMethodEntity = await this.countryAuthorityMethodRepository.runInTransaction(async transaction => {
      const countryAuthorityMethod = await this.countryAuthorityMethodRepository
        .findOneOrThrow(countryAuthority.id, payload.methodCode, transaction);

      if (countryAuthorityMethod.isEnabled === payload.isEnabled) {
        return countryAuthorityMethod;
      }

      return this.countryAuthorityMethodRepository.update(countryAuthorityMethod.id, {
        isEnabled: payload.isEnabled,
      }, transaction);
    });

    return { isEnabled: method.isEnabled };
  }
}
