import { CountryAuthorityDto, CountryAuthorityEntity, UseCase } from '@core';
import { AuthorityRepository, CountryAuthorityRepository, CountryRepository } from '@infra/repos';
import { ConflictError, NotFoundError } from '@internal/errors-library';
import { CountryAuthorityFactory } from '@domains/countries-authorities/factories';
import { CountryAuthorityMapper } from '@domains/countries-authorities/mappers';

export interface CreateCountryAuthorityOptions {
  countryAuthorityRepository: CountryAuthorityRepository;
  countryRepository: CountryRepository;
  authorityRepository: AuthorityRepository;
}

export class CreateCountryAuthority extends UseCase<CountryAuthorityDto, CountryAuthorityDto> {
  private readonly countryAuthorityRepository: CountryAuthorityRepository;
  private readonly countryRepository: CountryRepository;
  private readonly authorityRepository: AuthorityRepository;

  constructor(options: CreateCountryAuthorityOptions) {
    super(options);
    this.countryAuthorityRepository = options.countryAuthorityRepository;
    this.countryRepository = options.countryRepository;
    this.authorityRepository = options.authorityRepository;
  }

  public async execute(payload: CountryAuthorityDto): Promise<CountryAuthorityDto> {
    await this.checkInvariants(payload);

    const entity = await this.createCountryAuthority(payload);

    return CountryAuthorityMapper.mapToDto(entity);
  }

  private async createCountryAuthority(payload: CountryAuthorityDto): Promise<CountryAuthorityEntity> {
    const entity = CountryAuthorityFactory.createEntity(payload);

    return await this.countryAuthorityRepository.create(entity);
  }

  private async checkInvariants(payload: CountryAuthorityDto): Promise<void> {
    await Promise.all([
      this.throwIfCountryNotExist(payload.country),
      this.throwIfAuthorityNotExist(payload.authority),
    ]);

    await this.throwIfCountryAuthorityExist(payload);
  }

  private async throwIfCountryNotExist(country: string): Promise<void | never> {
    if (!(await this.countryRepository.findOne({ iso2: country }))) {
      throw new NotFoundError('Country not found', { id: country });
    }
  }

  private async throwIfAuthorityNotExist(fullCode: string): Promise<void | never> {
    if (!(await this.authorityRepository.findOne({ fullCode }))) {
      throw new NotFoundError('Authority not found', { id: fullCode });
    }
  }

  private async throwIfCountryAuthorityExist(payload: CountryAuthorityDto): Promise<void | never> {
    const countryAuthority = await this.countryAuthorityRepository.findOne({
      countryIso2: payload.country,
      authorityFullCode: payload.authority,
    });

    if (countryAuthority) {
      throw new ConflictError('CountryAuthority already exists', { id: payload });
    }
  }
}
