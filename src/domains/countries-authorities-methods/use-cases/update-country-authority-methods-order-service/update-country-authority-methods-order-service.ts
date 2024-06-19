import { Knex } from 'knex';

import { CountryAuthorityMethodWithCodeDto, UseCase } from '@core';
import { CountryAuthorityMethodRepository, CountryAuthorityRepository } from '@infra/repos';

import { UpdateCountryAuthorityMethodsOrderResponse, UpdateCountryAuthorityMethodsOrderServiceParams } from './types';
import { UpdateCountryAuthorityMethodsOrderValidator } from './update-country-authority-methods-order-validator';

export interface UpdateMethodsOrderServiceOptions {
  countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
}

export class UpdateCountryAuthorityMethodsOrderService extends UseCase<
  UpdateCountryAuthorityMethodsOrderServiceParams,
  UpdateCountryAuthorityMethodsOrderResponse
> {
  private readonly countryAuthorityMethodRepository: CountryAuthorityMethodRepository;
  private readonly countryAuthorityRepository: CountryAuthorityRepository;

  constructor(options: UpdateMethodsOrderServiceOptions) {
    super(options);
    this.countryAuthorityMethodRepository = options.countryAuthorityMethodRepository;
    this.countryAuthorityRepository = options.countryAuthorityRepository;
  }

  public async execute(payload: UpdateCountryAuthorityMethodsOrderServiceParams): Promise<UpdateCountryAuthorityMethodsOrderResponse> {
    const { country, authority, methodCodes } = payload;
    const lowerCaseCodes = methodCodes.map(c => c.toLowerCase());

    UpdateCountryAuthorityMethodsOrderValidator.validateMethodCodes(lowerCaseCodes);

    await this.countryAuthorityRepository.findOneOrThrow(authority, country);

    const countryAuthorityMethods = await this.countryAuthorityMethodRepository.runInTransaction(async tx => {
      const countryAuthorityMethodEntities = await this.countryAuthorityMethodRepository.findByCountryAuthorities({
        country,
        authority,
      }, tx);

      UpdateCountryAuthorityMethodsOrderValidator.validateCountryAuthorityMethods(countryAuthorityMethodEntities, lowerCaseCodes);

      await this.updateDepositsOrders(countryAuthorityMethodEntities, lowerCaseCodes, tx);

      return countryAuthorityMethodEntities;
    });

    return {
      methodCodes: countryAuthorityMethods
        .sort((a, b) => a.depositsOrder! - b.depositsOrder!)
        .map(({ code }) => code),
    };
  }


  private async updateDepositsOrders(entities: CountryAuthorityMethodWithCodeDto[], methodCodes: string[], tx: Knex.Transaction): Promise<void> {
    for (const entity of entities) {
      entity.depositsOrder = methodCodes.findIndex(c => c === entity.code.toLowerCase());
    }

    await Promise.all(entities.map(({ id, depositsOrder }) =>
      this.countryAuthorityMethodRepository.update(id, { depositsOrder }, tx))
    );
  }
}
