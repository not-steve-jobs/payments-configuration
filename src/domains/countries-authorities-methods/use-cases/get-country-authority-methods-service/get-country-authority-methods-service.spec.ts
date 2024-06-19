import * as casual from 'casual';

import { NotFoundError } from '@internal/errors-library';
import { CountryAuthorityEntity } from '@core';
import {
  CountryAuthorityMethodRepository,
  CountryAuthorityRepository,
} from '@infra';
import { armenia, countryAuthorityMethodsWithProviders, ukAuthority } from '@test/fixtures';
import {
  GetCountryAuthorityMethodsService,
  GetCountryAuthorityMethodsServiceOptions,
  GetCountryAuthorityMethodsServiceParams, GetCountryAuthorityMethodsServiceResponse,
} from '@domains/countries-authorities-methods';

describe('GetCountryAuthorityMethodsService', () => {
  it('Should throw an error if country-authority not found', async () => {
    const payload: GetCountryAuthorityMethodsServiceParams = { country: 'AR', authority: 'FSCM' };
    const dependencies: GetCountryAuthorityMethodsServiceOptions = {
      countryAuthorityRepository: mock<CountryAuthorityRepository>({
        findOneOrThrow: jest.fn().mockRejectedValue(new NotFoundError('Country\'s authority not found', { id: null })),
      }),
      countryAuthorityMethodRepository: mock<CountryAuthorityMethodRepository>({
        findWithProvidersByCountryAuthority: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const service = new GetCountryAuthorityMethodsService(dependencies);

    await expect(service.execute(payload)).rejects.toThrow('Country\'s authority not found');
    expect(dependencies.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(payload.authority, payload.country);
    expect(dependencies.countryAuthorityMethodRepository.findWithProvidersByCountryAuthority).not.toHaveBeenCalled();
  });

  it('Should return an empty list of payment methods', async () => {
    const payload: GetCountryAuthorityMethodsServiceParams = { country: 'AR', authority: 'FSCM' };
    const countryAuthority = mock<CountryAuthorityEntity>({
      id: casual.uuid,
      countryIso2: armenia.iso2,
      authorityFullCode: ukAuthority.fullCode,
    });
    const dependencies: GetCountryAuthorityMethodsServiceOptions = {
      countryAuthorityRepository: mock<CountryAuthorityRepository>({
        findOneOrThrow: jest.fn().mockResolvedValue(countryAuthority),
      }),
      countryAuthorityMethodRepository: mock<CountryAuthorityMethodRepository>({
        findWithProvidersByCountryAuthority: jest.fn().mockResolvedValue([]),
      }),
    };
    const expectedResult: GetCountryAuthorityMethodsServiceResponse = {
      paymentMethodConfigs: [],
    };

    const service = new GetCountryAuthorityMethodsService(dependencies);
    const result = await service.execute(payload);

    expect(dependencies.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(payload.authority, payload.country);
    expect(dependencies.countryAuthorityMethodRepository.findWithProvidersByCountryAuthority).toBeCalledOnceWith(countryAuthority.id);
    expect(result).toStrictEqual(expectedResult);
  });

  it('Should return a non-empty list of payment methods', async () => {
    const payload: GetCountryAuthorityMethodsServiceParams = { country: 'AR', authority: 'FSCM' };
    const countryAuthority = mock<CountryAuthorityEntity>({
      id: casual.uuid,
      countryIso2: payload.country,
      authorityFullCode: payload.authority,
    });

    const dependencies: GetCountryAuthorityMethodsServiceOptions = {
      countryAuthorityRepository: mock<CountryAuthorityRepository>({
        findOneOrThrow: jest.fn().mockResolvedValue(countryAuthority),
      }),
      countryAuthorityMethodRepository: mock<CountryAuthorityMethodRepository>({
        findWithProvidersByCountryAuthority: jest.fn().mockResolvedValue(countryAuthorityMethodsWithProviders),
      }),
    };
    const expectedResult: GetCountryAuthorityMethodsServiceResponse = {
      paymentMethodConfigs: [
        { methodCode: 'cards', methodName: 'Visa/Mastercard', isEnabled: true, providers: ['Stripe', 'Ingenico'] },
        { methodCode: 'btc', methodName: 'Bitcoin', isEnabled: true, providers: ['Orbital'] },
      ],
    };

    const service = new GetCountryAuthorityMethodsService(dependencies);
    const result = await service.execute(payload);

    expect(dependencies.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(payload.authority, payload.country);
    expect(dependencies.countryAuthorityMethodRepository.findWithProvidersByCountryAuthority).toBeCalledOnceWith(countryAuthority.id);
    expect(result).toStrictEqual(expectedResult);
    result.paymentMethodConfigs.forEach(pm => {
      expect(pm.providers).toStrictEqual(Array.from(new Set(pm.providers)));
    });
  });
});
