import { Knex } from 'knex';

import { CountryAuthorityDto, FieldEntity, FieldOptionEntity } from '@core/contracts';
import { FieldOptionRepository, FieldRepository, ProviderMethodRepository } from '@infra/repos';
import { NotFoundError } from '@internal/errors-library';

import { FieldMapper, SpecificFieldGroupMapper, UpsertFieldMapper } from '../mappers';
import { FieldWithOptionsDto, SpecificFieldsDto, SpecificFieldsFlatGroupDto } from '../types';

export interface FieldsServiceOptions {
  fieldRepository: FieldRepository;
  fieldOptionRepository: FieldOptionRepository;
  providerMethodRepository: ProviderMethodRepository;
}

interface ProviderMethodFieldsWithOptions {
  fields: FieldEntity[];
  options: FieldOptionEntity[];
}

interface Fields {
  common: FieldWithOptionsDto[];
  specific: SpecificFieldsDto[];
}

interface FieldsSpecificUpsertDto {
  flatFieldGroups: SpecificFieldsFlatGroupDto[];
  fieldsAndOptions: ProviderMethodFieldsWithOptions[];
}

export class FieldsService {
  private readonly fieldOptionRepository: FieldOptionRepository;
  private readonly fieldRepository: FieldRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;

  constructor(options: FieldsServiceOptions) {
    this.fieldOptionRepository = options.fieldOptionRepository;
    this.fieldRepository = options.fieldRepository;
    this.providerMethodRepository = options.providerMethodRepository;
  }

  public async upsert(providerId: string, commonFields: FieldWithOptionsDto[], specificFields: SpecificFieldsDto[]): Promise<Fields> {
    return await this.fieldRepository.runInTransaction<Fields>(async tx => {
      const [common, specific] = await Promise.all([
        this.createCommon(providerId, commonFields, tx),
        this.createSpecific(providerId, specificFields, tx),
      ]);

      return { common, specific };
    });
  }

  private async createCommon(providerId: string, fieldsCommon: FieldWithOptionsDto[], tx: Knex.Transaction): Promise<FieldWithOptionsDto[]> {
    const fieldsWithOptions = UpsertFieldMapper.createCommon(providerId, fieldsCommon);

    const fields = await this.fieldRepository.upsertCommonFields(providerId, fieldsWithOptions.fields, tx);
    const fieldOptions = await this.fieldOptionRepository.createList(fieldsWithOptions.options, tx);

    return FieldMapper.createWithOptionsDtoList(fields, fieldOptions);
  }

  private async createSpecific(providerId: string, fieldsDtoList: SpecificFieldsDto[], tx: Knex.Transaction): Promise<SpecificFieldsDto[]> {
    await this.fieldRepository.deleteAllSpecificFields(providerId, tx);

    if (!fieldsDtoList.length) {
      return [];
    }

    const {
      flatFieldGroups,
      fieldsAndOptions,
    } = await this.buildSpecificUpsertDto(providerId, fieldsDtoList);

    await this.insertSpecificFieldsWithOptions(fieldsAndOptions, tx);

    return SpecificFieldGroupMapper.mergeFieldGroups(flatFieldGroups);
  }

  // TODO Method should be reworked and mappers/factories revised due to high complexity
  private async buildSpecificUpsertDto(providerId: string, fieldsDtoList: SpecificFieldsDto[]): Promise<FieldsSpecificUpsertDto> {
    const countryAuthorities = this.getCountryAuthorities(fieldsDtoList);
    const providerMethodsMap = await this.getCountryAuthorityToPmIdsMap(providerId, countryAuthorities);
    this.validateCountryAuthoritiesExistence(providerMethodsMap, countryAuthorities);

    const fieldsWithOptions = SpecificFieldGroupMapper.unwrapFieldGroupsToFlat(fieldsDtoList, providerMethodsMap);

    const flatFieldGroups: SpecificFieldsFlatGroupDto[] = [];
    const countryAuthorityToFieldsMap = new Map<string, ProviderMethodFieldsWithOptions>;

    for (const fieldWithOptionsDto of fieldsWithOptions) {
      const key = `${fieldWithOptionsDto.country}:${fieldWithOptionsDto.authority}`;
      const existingFieldGroup = countryAuthorityToFieldsMap.get(key);

      if (existingFieldGroup) {
        existingFieldGroup.fields.push(...fieldWithOptionsDto.fieldsWithOptions.fields);
        existingFieldGroup.options.push(...fieldWithOptionsDto.fieldsWithOptions.options);

        flatFieldGroups.push(SpecificFieldGroupMapper.createFlatFieldGroup(fieldWithOptionsDto));
        continue;
      }

      countryAuthorityToFieldsMap.set(key, {
        fields: [...fieldWithOptionsDto.fieldsWithOptions.fields],
        options: [...fieldWithOptionsDto.fieldsWithOptions.options],
      });

      flatFieldGroups.push(SpecificFieldGroupMapper.createFlatFieldGroup(fieldWithOptionsDto));
    }

    return {
      flatFieldGroups,
      fieldsAndOptions: Array.from(countryAuthorityToFieldsMap.values()),
    };
  }

  public validateCountryAuthoritiesExistence(caToPmIdsMap: Map<string, string[]>, countryAuthorities: CountryAuthorityDto[]): void | never {
    for (const { country, authority } of countryAuthorities) {
      const key = `${country}:${authority}`;
      const pmIds = caToPmIdsMap.get(key);
      if (!pmIds) {
        throw new NotFoundError(`Unknown Country-Authority for this provider`, { id: key });
      }
    }
  }

  private async insertSpecificFieldsWithOptions(
    fieldsAndOptions: ProviderMethodFieldsWithOptions[],
    tx: Knex.Transaction
  ): Promise<void> {
    const fields = fieldsAndOptions.flatMap(fao => fao.fields);
    const options = fieldsAndOptions.flatMap(fao => fao.options);

    await this.fieldRepository.batchInsert(fields, tx);

    if (options.length) {
      await this.fieldOptionRepository.batchInsert(options, tx);
    }
  }

  private getCountryAuthorities(fields: SpecificFieldsDto[]): CountryAuthorityDto[] {
    const keyToCountryAuthority = new Map<string, CountryAuthorityDto>;

    for (const { parameters: { countriesAuthorities } } of fields) {
      for (const { country, authority } of countriesAuthorities) {
        const key = `${country}:${authority}`;

        if (!keyToCountryAuthority.has(key)) {
          keyToCountryAuthority.set(key, { country, authority });
        }
      }
    }

    return Array.from(keyToCountryAuthority.values());
  }

  private async getCountryAuthorityToPmIdsMap(
    providerId: string,
    countryAuthorities: CountryAuthorityDto[]
  ): Promise<Map<string, string[]>> {
    const { countries, authorities } = countryAuthorities.reduce((acc, next) => {
      acc.countries.add(next.country);
      acc.authorities.add(next.authority);
      return acc;
    }, { countries: new Set<string>, authorities: new Set<string>() });

    const providerMethods = await this.providerMethodRepository.findWithCountryAuthority(providerId, {
      countries: Array.from(countries),
      authorities: Array.from(authorities),
    });

    return providerMethods.reduce((map, pm) => {
      const key = `${pm.countryIso2}:${pm.authorityFullCode}`;
      const pmIds = map.get(key) || [];
      pmIds.push(pm.id);
      map.set(key, pmIds);
      return map;
    }, new Map<string, string[]>());
  }
}
