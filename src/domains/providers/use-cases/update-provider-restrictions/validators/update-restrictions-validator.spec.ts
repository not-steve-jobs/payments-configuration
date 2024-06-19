import { Condition, ProviderRestrictionsGroupDto } from '@domains/providers';
import { ApplicationPlatforms, CountryAuthorityEntity } from '@core';

import { UpdateRestrictionsValidator } from './update-restrictions-validator';

describe('UpdateRestrictionsValidator', () => {
  it('should throw an error for duplicate platforms', () => {
    const restrictions: ProviderRestrictionsGroupDto[] = [
      { platform: ApplicationPlatforms.IOS, countriesAuthorities: [], settings: [], isEnabled: true },
      { platform: ApplicationPlatforms.IOS, countriesAuthorities: [], settings: [], isEnabled: true },
    ];

    expect(() =>
      UpdateRestrictionsValidator.validate(restrictions, { countriesAuthoritiesBounded: [] })
    ).toThrow('Restrictions contain platform duplicates');
  });

  it('should throw an error for duplicate countriesAuthorities', () => {
    const restrictions: ProviderRestrictionsGroupDto[] = [
      {
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: true,
        countriesAuthorities: [
          { authority: 'authority1', country: 'country1' },
          { authority: 'authority1', country: 'country1' },
        ],
        settings: [],
      },
    ];

    expect(() =>
      UpdateRestrictionsValidator.validate(restrictions, {
        countriesAuthoritiesBounded: [
          mock<CountryAuthorityEntity>({ authorityFullCode: 'authority1', countryIso2: 'country1' }),
        ],
      })
    ).toThrow('In the request there are countries-authorities with duplicates');
  });

  it('should throw an error for duplicate conditions', () => {
    const restrictions: ProviderRestrictionsGroupDto[] = [
      {
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: true,
        countriesAuthorities: [],
        settings: [
          { condition: Condition.GTE, version: '1.0' },
          { condition: Condition.GTE, version: '1.0' },
        ],
      },
    ];

    expect(() =>
      UpdateRestrictionsValidator.validate(restrictions, { countriesAuthoritiesBounded: [] })
    ).toThrow('android restrictions contain duplicate conditions');
  });

  it('should throw an error for duplicate versions', () => {
    const restrictions: ProviderRestrictionsGroupDto[] = [
      {
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: true,
        countriesAuthorities: [],
        settings: [
          { condition: Condition.GTE, version: '1.0' },
          { condition: Condition.EQ, version: '1.0' },
        ],
      },
    ];

    expect(() =>
      UpdateRestrictionsValidator.validate(restrictions, { countriesAuthoritiesBounded: [] })
    ).toThrow('android restrictions contain duplicate versions');
  });

  it('should not throw an error for valid restrictions', () => {
    const restrictions: ProviderRestrictionsGroupDto[] = [
      {
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: true,
        countriesAuthorities: [],
        settings: [
          { condition: Condition.EQ, version: '1.0' },
          { condition: Condition.EQ, version: '1.1' },
        ],
      },
    ];

    expect(() =>
      UpdateRestrictionsValidator.validate(restrictions, { countriesAuthoritiesBounded: [] })
    ).not.toThrow();
  });

  it('should throw if country authority is not mapped to provider', () => {
    const restrictions: ProviderRestrictionsGroupDto[] = [
      {
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: true,
        countriesAuthorities: [
          { authority: 'authority1', country: 'country1' },
        ],
        settings: [
          { condition: Condition.GTE, version: '1.0' },
        ],
      },
    ];

    expect(() =>
      UpdateRestrictionsValidator.validate(restrictions, { countriesAuthoritiesBounded: [] })
    ).toThrow('In the request there are countries-authorities that are not mapped to the provider');
  });
});
