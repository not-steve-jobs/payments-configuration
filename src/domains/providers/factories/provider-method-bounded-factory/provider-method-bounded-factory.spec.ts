import casual from 'casual';

import { CountryAuthorityDto, MethodEntity } from '@core';
import { ProviderMethodBoundedState } from '@domains/providers/types';

import { CreateDtoOptions, ProviderMethodBoundedFactory } from './provider-method-bounded-factory';

describe('ProviderMethodBoundedFactory', () => {
  it('Should return an array of not_bounded methods if there is no providerBoundedMethods are provided to CA', () => {
    const options: CreateDtoOptions = {
      methods: mock<MethodEntity[]>([
        { code: 'test1', name: 'test1' },
        { code: 'test2', name: 'test2' },
        { code: 'test3', name: 'test3' },
      ]),
      methodCodeToBoundedCAMap: new Map<string, Map<string, CountryAuthorityDto>>(),
      countryAuthorityIds: [],
    };

    expect(ProviderMethodBoundedFactory.createDto(options)).toStrictEqual([
      { methodName: 'test1', methodCode: 'test1', state: ProviderMethodBoundedState.NOT_BOUNDED, boundedCA: [] },
      { methodName: 'test2', methodCode: 'test2', state: ProviderMethodBoundedState.NOT_BOUNDED, boundedCA: [] },
      { methodName: 'test3', methodCode: 'test3', state: ProviderMethodBoundedState.NOT_BOUNDED, boundedCA: [] },
    ]);
  });

  it('Should return a mix of not_bounded and bounded methods if there is no CA for some methods', () => {
    const authority = casual.word, country = casual.country_code;
    const options: CreateDtoOptions = {
      methods: mock<MethodEntity[]>([
        { code: 'test1', name: 'test1' },
        { code: 'test2', name: 'test2' },
        { code: 'test3', name: 'test3' },
      ]),
      methodCodeToBoundedCAMap: new Map<string, Map<string, CountryAuthorityDto>>([
        ['test1', new Map<string, CountryAuthorityDto>([['1', { authority, country }]])],
      ]),
      countryAuthorityIds: ['1'],
    };

    expect(ProviderMethodBoundedFactory.createDto(options)).toStrictEqual([
      { methodName: 'test1', methodCode: 'test1', state: ProviderMethodBoundedState.BOUNDED, boundedCA: [{ authority, country }] },
      { methodName: 'test2', methodCode: 'test2', state: ProviderMethodBoundedState.NOT_BOUNDED, boundedCA: [] },
      { methodName: 'test3', methodCode: 'test3', state: ProviderMethodBoundedState.NOT_BOUNDED, boundedCA: [] },
    ]);
  });

  it('Should return all bounded methods if there is no CA for any method', () => {
    const authority = casual.word, country = casual.country_code;
    const options: CreateDtoOptions = {
      methods: mock<MethodEntity[]>([
        { code: 'test1', name: 'test1' },
        { code: 'test2', name: 'test2' },
        { code: 'test3', name: 'test3' },
      ]),
      methodCodeToBoundedCAMap: new Map<string, Map<string, CountryAuthorityDto>>([
        ['test1', new Map<string, CountryAuthorityDto>([['1', { authority, country }]])],
        ['test2', new Map<string, CountryAuthorityDto>([['1', { authority, country }]])],
        ['test3', new Map<string, CountryAuthorityDto>([['1', { authority, country }]])],
      ]),
      countryAuthorityIds: ['1'],
    };

    expect(ProviderMethodBoundedFactory.createDto(options)).toStrictEqual([
      { methodName: 'test1', methodCode: 'test1', state: ProviderMethodBoundedState.BOUNDED, boundedCA: [{ authority, country }] },
      { methodName: 'test2', methodCode: 'test2', state: ProviderMethodBoundedState.BOUNDED, boundedCA: [{ authority, country }] },
      { methodName: 'test3', methodCode: 'test3', state: ProviderMethodBoundedState.BOUNDED, boundedCA: [{ authority, country }] },
    ]);
  });

  it('Should return mixed states based on CA presence for specific methods', () => {
    const authority = casual.word, country = casual.country_code, country2 = casual.country_code, country3 = casual.country_code;
    const options: CreateDtoOptions = {
      methods: mock<MethodEntity[]>([
        { code: 'test1', name: 'test1' },
        { code: 'test2', name: 'test2' },
        { code: 'test3', name: 'test3' },
        { code: 'test4', name: 'test4' },
      ]),
      methodCodeToBoundedCAMap: new Map<string, Map<string, CountryAuthorityDto>>([
        ['test1', new Map<string, CountryAuthorityDto>([
          ['1', { authority, country }],
          ['2', { authority, country: country2 }],
          ['3', { authority, country: country3 }],
        ]
        )],
        ['test2', new Map<string, CountryAuthorityDto>([['1', { authority, country }]])],
        ['test3', new Map<string, CountryAuthorityDto>([['1', { authority, country }]])],
      ]),
      countryAuthorityIds: ['1', '2', '3'],
    };

    expect(ProviderMethodBoundedFactory.createDto(options)).toStrictEqual([
      { methodName: 'test1', methodCode: 'test1', state: ProviderMethodBoundedState.BOUNDED, boundedCA: [
        { authority, country },
        { authority, country: country2 },
        { authority, country: country3 },
      ] },
      { methodName: 'test2', methodCode: 'test2', state: ProviderMethodBoundedState.MIXED, boundedCA: [{ authority, country }] },
      { methodName: 'test3', methodCode: 'test3', state: ProviderMethodBoundedState.MIXED, boundedCA: [{ authority, country }] },
      { methodName: 'test4', methodCode: 'test4', state: ProviderMethodBoundedState.NOT_BOUNDED, boundedCA: [] },
    ]);
  });
});
