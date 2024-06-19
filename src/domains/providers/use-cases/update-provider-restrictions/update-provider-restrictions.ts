import { CountryAuthorityEntity, UseCase } from '@core';
import { CountryAuthorityRepository, ProviderMethodRepository, ProviderRepository, ProviderRestrictionsRepository } from '@infra';
import { ProviderRestrictionsGroupDto, UpdateProviderRestrictionsParams } from '@domains/providers';
import { ProviderRestrictionsMapper } from '@domains/providers/mappers';
import { objectToKey } from '@utils';

import { UpdateRestrictionsValidator } from './validators';

export interface UpdateProviderPlatformVersionsOptions {
  providerRepository: ProviderRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
  providerRestrictionsRepository: ProviderRestrictionsRepository;
  providerMethodRepository: ProviderMethodRepository;
}

export class UpdateProviderRestrictions extends UseCase<UpdateProviderRestrictionsParams, ProviderRestrictionsGroupDto[]> {
  private readonly providerRepository: ProviderRepository;
  private readonly providerRestrictionsRepository: ProviderRestrictionsRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;

  constructor(options: UpdateProviderPlatformVersionsOptions) {
    super(options);
    this.providerRepository = options.providerRepository;
    this.providerRestrictionsRepository = options.providerRestrictionsRepository;
    this.providerMethodRepository = options.providerMethodRepository;
  }

  public async execute({ providerCode, restrictions }: UpdateProviderRestrictionsParams): Promise<ProviderRestrictionsGroupDto[]> {
    const [countriesAuthoritiesBounded] = await Promise.all([
      this.providerMethodRepository.findCABoundedToProvider(providerCode),
      this.providerRepository.findOneOrThrow({ code: providerCode }),
    ]);
    UpdateRestrictionsValidator.validate(restrictions, { countriesAuthoritiesBounded });

    const countriesAuthorities = this.getCountryAuthoritiesToUpdate(restrictions, countriesAuthoritiesBounded);
    const restrictionEntities = ProviderRestrictionsMapper.createEntities({
      providerCode,
      countriesAuthorities,
      restrictions,
    });

    const providerRestrictions = await this.providerRestrictionsRepository.replaceAllByProviderCode(providerCode, restrictionEntities);
    return ProviderRestrictionsMapper.createGroup(providerRestrictions);
  }

  private getCountryAuthoritiesToUpdate(
    restrictions: ProviderRestrictionsGroupDto[],
    countryAuthorities: CountryAuthorityEntity[]
  ): CountryAuthorityEntity[] {
    const countryAuthoritiesSet = restrictions.reduce((acc, next) => {
      next.countriesAuthorities.forEach(({ authority, country }) => {
        acc.add(objectToKey({ country, authority }));
      });

      return acc;
    }, new Set<string>());

    return countryAuthorities.filter(({ authorityFullCode, countryIso2 }) =>
      countryAuthoritiesSet.has(objectToKey({ country: countryIso2, authority: authorityFullCode })));
  }
}
