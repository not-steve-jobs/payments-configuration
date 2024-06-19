// TODO: deprecated
import casual from 'casual';

import { ConfigFieldWithOptionDto, FieldEntityType, TransactionType } from '@core';
import { GetProviderFieldsServiceParams, SpecificFieldWithOptionDto } from '@domains/providers';

import { GetProviderFieldsServiceOptions, GetProviderFieldsServiceV1 } from './get-provider-fields-service-v1';


const generateFieldWithOptionDto = (fieldOptions = false, options: Partial<ConfigFieldWithOptionDto> = {}): ConfigFieldWithOptionDto => ({
  entityId: casual.uuid,
  entityType: FieldEntityType.PROVIDER,
  key: casual.string,
  value: casual.string,
  valueType: casual.word,
  transactionType: casual.random_value(TransactionType),
  isEnabled: true,
  isMandatory: true,
  defaultValue: null,
  pattern: null,
  optionId: fieldOptions ? casual.uuid : null,
  optionKey: fieldOptions ? casual.string : null,
  optionValue: fieldOptions ? casual.string : null,
  optionIsEnabled: fieldOptions ? casual.boolean : null,
  currencyIso3: '',
  ...options,
}) as ConfigFieldWithOptionDto;

const generateSpecificFieldWithOptionDto = (fieldOptions = false, options: Partial<SpecificFieldWithOptionDto> = {}): SpecificFieldWithOptionDto => ({
  authority: casual.word,
  country: casual.word,
  currency: '',
  key: casual.word,
  value: casual.word,
  valueType: casual.word,
  transactionType: casual.random_value(TransactionType),
  isEnabled: true,
  isMandatory: true,
  defaultValue: null,
  pattern: null,
  optionKey: fieldOptions ? casual.word : null,
  optionValue: fieldOptions ? casual.word : null,
  optionIsEnabled: fieldOptions ? casual.boolean : null,
  ...options,
}) as SpecificFieldWithOptionDto;

describe('GetFieldsService', () => {
  const providerCode = casual.word;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should return no fields', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(0);
    expect(specific).toHaveLength(0);
  });

  it('Should return single common field with no options', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const fieldWithOption = generateFieldWithOptionDto();
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([fieldWithOption]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(specific).toHaveLength(0);
    expect(common).toHaveLength(1);
    expect(common[0].options).toHaveLength(0);
  });

  it('Should return two common fields with no options', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([ generateFieldWithOptionDto(), generateFieldWithOptionDto() ]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(specific).toHaveLength(0);
    expect(common).toHaveLength(2);
    common.forEach(cf => expect(cf.options).toHaveLength(0));
  });

  it('Should return single common field with two options', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const fieldWithOption1 = generateFieldWithOptionDto(true);
    const fieldWithOption2 = generateFieldWithOptionDto(true, {
      key: fieldWithOption1.key,
      transactionType: fieldWithOption1.transactionType,
    });
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([ fieldWithOption1, fieldWithOption2 ]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(specific).toHaveLength(0);
    expect(common).toHaveLength(1);
    expect(common[0].options).toHaveLength(2);
  });

  it('Should return one group with two specific fields without options', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const parameters = {
      authority: casual.word,
      country: casual.word,
      currency: '',
    };
    const commonField = generateFieldWithOptionDto();
    const specificFieldWithOption1 = generateSpecificFieldWithOptionDto(false, { ...parameters });
    const specificFieldWithOption2 = generateSpecificFieldWithOptionDto(false, { ...parameters });
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([commonField]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([specificFieldWithOption1, specificFieldWithOption2]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(1);
    expect(specific).toHaveLength(1);
    expect(specific[0].parameters).toStrictEqual({
      countriesAuthorities: [{ authority: parameters.authority, country: parameters.country }],
      currencies: [],
    });
    expect(specific[0].fields).toHaveLength(2);
  });

  it('Should return one group with single specific fields with two options', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const parameters = {
      authority: casual.word,
      country: casual.word,
      currency: '',
    };
    const commonField = generateFieldWithOptionDto();
    const specificFieldWithOption1 = generateSpecificFieldWithOptionDto(true, { ...parameters });
    const specificFieldWithOption2 = generateSpecificFieldWithOptionDto(true, {
      ...specificFieldWithOption1,
      optionKey: casual.string,
      optionValue: casual.string,
    });
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([commonField]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([specificFieldWithOption1, specificFieldWithOption2]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(1);
    expect(specific).toHaveLength(1);
    expect(specific[0].parameters).toStrictEqual({
      countriesAuthorities: [{ authority: parameters.authority, country: parameters.country }],
      currencies: [],
    });
    expect(specific[0].fields).toHaveLength(1);
    expect(specific[0].fields[0].options).toHaveLength(2);
  });

  it('Should return one group with two parameters and field without options', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const commonField = generateFieldWithOptionDto();
    const specificFieldWithOption1 = generateSpecificFieldWithOptionDto(false);
    const specificFieldWithOption2 = generateSpecificFieldWithOptionDto(false, {
      ...specificFieldWithOption1,
      country: specificFieldWithOption1.country + 2,
    });
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([commonField]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([specificFieldWithOption1, specificFieldWithOption2]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(1);
    expect(specific).toHaveLength(1);
    expect(specific[0].parameters.countriesAuthorities).toHaveLength(2);
    expect(specific[0].fields).toHaveLength(1);
  });

  //feature was rolled back till requirements will be clear
  it.skip('Should return special as common fields if common is empty and there is only one fields group', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const parameters = {
      authority: casual.word,
      country: casual.word,
      currency: '',
    };
    const specificFieldWithOption1 = generateSpecificFieldWithOptionDto(false, { ...parameters });
    const specificFieldWithOption2 = generateSpecificFieldWithOptionDto(false, { ...parameters });
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([]),
        getOrderedSpecificFieldsWithOptions: jest.fn().mockResolvedValue([specificFieldWithOption1, specificFieldWithOption2]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(2);
    expect(specific).toHaveLength(0);
  });

  it('Should return one group for countryAuthorities with the same currencies', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const commonField = generateFieldWithOptionDto();
    const specificFieldWithOption1_1 = generateSpecificFieldWithOptionDto(false, { currency: 'EUR' });
    const specificFieldWithOption1_2 = generateSpecificFieldWithOptionDto(false, {
      ...specificFieldWithOption1_1,
      currency: 'USD',
    });
    const specificFieldWithOption2_1 = generateSpecificFieldWithOptionDto(false, {
      ...specificFieldWithOption1_1,
      authority: casual.word,
      country: casual.word,
    });
    const specificFieldWithOption2_2 = generateSpecificFieldWithOptionDto(false, {
      ...specificFieldWithOption1_2,
      authority: specificFieldWithOption2_1.authority,
      country: specificFieldWithOption2_1.country,
    });

    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([commonField]),
        getOrderedSpecificFieldsWithOptions: jest.fn()
          .mockResolvedValue([ specificFieldWithOption1_1, specificFieldWithOption1_2, specificFieldWithOption2_1, specificFieldWithOption2_2 ]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(1);
    expect(specific).toHaveLength(1);
    expect(specific[0].parameters.countriesAuthorities).toHaveLength(2);
    expect(specific[0].parameters.currencies).toStrictEqual(['EUR', 'USD']);
    expect(specific[0].fields).toHaveLength(1);
  });

  it('Should return two groups for countryAuthorities with different currencies', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const specificFieldWithOption1_1 = generateSpecificFieldWithOptionDto(false, { currency: 'EUR' });
    const specificFieldWithOption1_2 = generateSpecificFieldWithOptionDto(false, {
      ...specificFieldWithOption1_1,
      currency: 'USD',
    });
    const specificFieldWithOption2_1 = generateSpecificFieldWithOptionDto(false, {
      ...specificFieldWithOption1_1,
      authority: casual.word,
      country: casual.word,
    });

    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([]),
        getOrderedSpecificFieldsWithOptions: jest.fn()
          .mockResolvedValue([ specificFieldWithOption1_1, specificFieldWithOption1_2, specificFieldWithOption2_1 ]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(0);
    expect(specific).toHaveLength(2);
    specific.forEach(sf => {
      expect(sf.parameters.countriesAuthorities).toHaveLength(1);
      expect(sf.fields).toHaveLength(1);
    });
    expect(specific[0].parameters.currencies).toStrictEqual(['EUR', 'USD']);
    expect(specific[1].parameters.currencies).toStrictEqual(['EUR']);
  });

  it('Should return single common field and single group with specific fields with and without options', async () => {
    const payload: GetProviderFieldsServiceParams = { providerCode };
    const commonField = generateFieldWithOptionDto(true);
    const specificFieldWithOption1_1 = generateSpecificFieldWithOptionDto(true, { currency: casual.word });
    const specificFieldWithOption1_2 = generateSpecificFieldWithOptionDto(true, {
      ...specificFieldWithOption1_1,
      optionKey: casual.string,
      optionValue: casual.string,
    });
    const specificFieldWithOption2 = generateSpecificFieldWithOptionDto(false);
    const options = mock<GetProviderFieldsServiceOptions>({
      providerRepository: { findOne: jest.fn().mockResolvedValue({}) },
      fieldRepository: {
        findFieldsWithOptions: jest.fn().mockResolvedValue([commonField]),
        getOrderedSpecificFieldsWithOptions: jest.fn()
          .mockResolvedValue([ specificFieldWithOption1_1, specificFieldWithOption1_2, specificFieldWithOption2 ]),
      },
    });

    const service = new GetProviderFieldsServiceV1(options);
    const { common, specific } = await service.execute(payload);

    expect(common).toHaveLength(1);
    expect(specific).toHaveLength(2);
    expect(common).toMatchObject([{
      key: commonField.key,
      fieldType: commonField.valueType,
      transactionType: commonField.transactionType,
      name: commonField.value,
      defaultValue: commonField.defaultValue ?? undefined,
      pattern: commonField.pattern,
      isMandatory: commonField.isMandatory,
      isEnabled: commonField.isEnabled,
      options: [
        {
          key: commonField.optionKey,
          value: commonField.optionValue,
          isEnabled: commonField.optionIsEnabled,
        },
      ],
    }]);
    expect(specific).toMatchObject([
      {
        parameters: {
          countriesAuthorities: [{ authority: specificFieldWithOption1_1.authority, country: specificFieldWithOption1_1.country }],
          currencies: [specificFieldWithOption1_1.currency],
        },
        fields: [{
          key: specificFieldWithOption1_1.key,
          transactionType: specificFieldWithOption1_1.transactionType,
          fieldType: specificFieldWithOption1_1.valueType,
          name: specificFieldWithOption1_1.value,
          defaultValue: specificFieldWithOption1_1.defaultValue ?? undefined,
          pattern: specificFieldWithOption1_1.pattern,
          isMandatory: specificFieldWithOption1_1.isMandatory,
          isEnabled: specificFieldWithOption1_1.isEnabled,
          options: [
            {
              key: specificFieldWithOption1_1.optionKey,
              value: specificFieldWithOption1_1.optionValue,
              isEnabled: specificFieldWithOption1_1.optionIsEnabled,
            },
            {
              key: specificFieldWithOption1_2.optionKey,
              value: specificFieldWithOption1_2.optionValue,
              isEnabled: specificFieldWithOption1_2.optionIsEnabled,
            },
          ],
        }],
      },
      {
        parameters: {
          countriesAuthorities: [{ authority: specificFieldWithOption2.authority, country: specificFieldWithOption2.country }],
          currencies: [],
        },
        fields: [{
          key: specificFieldWithOption2.key,
          transactionType: specificFieldWithOption2.transactionType,
          fieldType: specificFieldWithOption2.valueType,
          name: specificFieldWithOption2.value,
          defaultValue: specificFieldWithOption2.defaultValue ?? undefined,
          pattern: specificFieldWithOption2.pattern,
          isMandatory: specificFieldWithOption2.isMandatory,
          isEnabled: specificFieldWithOption2.isEnabled,
        }],
      },
    ]);
  });
});
