import { ApplicationPlatforms } from '@core';

import {
  PlatformVersionsRestrictionsService,
  PlatformVersionsRestrictionsServiceOptions,
} from './platform-versions-restrictions-service';

describe('PlatformVersionsRestrictionsService', () => {
  it('Should throw error upon unknown condition', async () => {
    const options = mock<PlatformVersionsRestrictionsServiceOptions>({
      countryAuthorityRepository: {
        findOne: jest.fn().mockResolvedValue({}),
      },
      providerRestrictionsRepository: {
        getProviderRestrictionsByPlatformAndCA: jest.fn().mockResolvedValue([
          {
            providerCode: '1',
            platformName: ApplicationPlatforms.IOS,
            isEnabled: true,
            settings: JSON.stringify([{ condition: 'unknown', version: '1.0.0' }]) },
        ]),
      },
    });

    const service = new PlatformVersionsRestrictionsService(options);

    await expect(service.getAllowed({
      providerCodes: ['1'],
      authority: 'GM',
      country: 'CY',
      platform: 'ios',
      version: '1.0.0',
    }))
      .rejects.toThrow('unknown condition');
  });

  it('Should return empty array when there is no matching condition', async () => {
    const options = mock<PlatformVersionsRestrictionsServiceOptions>({
      countryAuthorityRepository: {
        findOne: jest.fn().mockResolvedValue({}),
      },
      providerRestrictionsRepository: {
        getProviderRestrictionsByPlatformAndCA: jest.fn().mockResolvedValue([
          {
            providerCode: '1',
            platformName: ApplicationPlatforms.IOS,
            isEnabled: true,
            settings: JSON.stringify([{ condition: 'gte', version: '2.0.0' }]) },
        ]),
      },
    });

    const service = new PlatformVersionsRestrictionsService(options);
    const response = await service.getAllowed({
      providerCodes: ['1'],
      authority: 'GM',
      country: 'CY',
      platform: 'ios',
      version: '1.0.0',
    });

    expect(response.size).toBe(0);
  });

  it('Should return ids when conditions match', async () => {
    const options = mock<PlatformVersionsRestrictionsServiceOptions>({
      countryAuthorityRepository: {
        findOne: jest.fn().mockResolvedValue({}),
      },
      providerRestrictionsRepository: {
        getProviderRestrictionsByPlatformAndCA: jest.fn().mockResolvedValue([
          {
            providerCode: '1',
            platformName: ApplicationPlatforms.IOS,
            isEnabled: true,
            settings: JSON.stringify([
              { condition: 'gte', version: '2.0.0' },
              { condition: 'lte', version: '3.0.0' },
            ]),
          },
          {
            providerCode: '2',
            platformName: ApplicationPlatforms.IOS,
            isEnabled: true,
            settings: JSON.stringify([
              { condition: 'gte', version: '2.0.0' },
              { condition: 'lte', version: '3.0.0' },
            ]),
          },
          {
            providerCode: '3',
            platformName: ApplicationPlatforms.IOS,
            isEnabled: true,
            settings: JSON.stringify([
              { condition: 'gte', version: '2.0.0' },
              { condition: 'lte', version: '3.0.0' },
            ]),
          },
        ]),
      },
    });

    const service = new PlatformVersionsRestrictionsService(options);
    const response = await service.getAllowed({
      providerCodes: ['1', '2', '3'],
      authority: 'GM',
      country: 'CY',
      platform: 'ios',
      version: '2.0.1',
    });

    expect(Array.from(response)).toStrictEqual(['1', '2', '3']);
  });

  it('Should return ids when multiple conditions match', async () => {
    const options = mock<PlatformVersionsRestrictionsServiceOptions>({
      countryAuthorityRepository: {
        findOne: jest.fn().mockResolvedValue({}),
      },
      providerRestrictionsRepository: {
        getProviderRestrictionsByPlatformAndCA: jest.fn().mockResolvedValue([
          {
            providerCode: '1',
            platformName: ApplicationPlatforms.IOS,
            isEnabled: true,
            settings: JSON.stringify([
              { condition: 'gte', version: '2.0.0' },
              { condition: 'lte', version: '3.0.0' },
              { condition: 'eq', version: '2.5.1' },
            ]) },
        ]),
      },
    });

    const service = new PlatformVersionsRestrictionsService(options);
    const response = await service.getAllowed({
      providerCodes: ['1'],
      authority: 'GM',
      country: 'CY',
      platform: 'ios',
      version: '2.5.1',
    });

    expect(response.size).toBe(1);
    expect(response.has('1')).toBe(true);
  });

  it('Should return empty array when one condition fails', async () => {
    const options = mock<PlatformVersionsRestrictionsServiceOptions>({
      countryAuthorityRepository: {
        findOne: jest.fn().mockResolvedValue({}),
      },
      providerRestrictionsRepository: {
        getProviderRestrictionsByPlatformAndCA: jest.fn().mockResolvedValue([
          {
            providerCode: '1',
            platformName: ApplicationPlatforms.IOS,
            isEnabled: true,
            settings: JSON.stringify([
              { condition: 'gte', version: '2.0.0' },
              { condition: 'lte', version: '3.0.0' },
              { condition: 'eq', version: '4.5.1' },
            ]) },
        ]),
      },
    });

    const service = new PlatformVersionsRestrictionsService(options);
    const response = await service.getAllowed({
      providerCodes: ['1'],
      authority: 'GM',
      country: 'CY',
      platform: 'ios',
      version: '1.0.0',
    });

    expect(response.size).toBe(0);
  });
});
