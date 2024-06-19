import casual from 'casual';

import { NotFoundError } from '@internal/errors-library';
import { CountryAuthorityEntity, CountryAuthorityMethodEntity } from '@core';
import { CountryAuthorityMethodRepository, CountryAuthorityRepository } from '@infra';
import { armenia, fscmAuthority } from '@test/fixtures';

import {
  UpdateCountryAuthorityMethodStatusService,
  UpdateCountryAuthorityMethodStatusServiceOptions,
  UpdateCountryAuthorityMethodStatusServiceParams,
} from '.';

describe('UpdateCountryAuthorityMethodStatusService', () => {
  const tx = {};
  const payload: UpdateCountryAuthorityMethodStatusServiceParams = {
    country: armenia.iso2, authority: fscmAuthority.fullCode, methodCode: 'cards', isEnabled: true,
  };
  const countryAuthority = mock<CountryAuthorityEntity>({
    id: casual.uuid, countryIso2: payload.country, authorityFullCode: payload.authority,
  });
  const method = mock<CountryAuthorityMethodEntity>({
    id: casual.uuid, countryAuthorityId: countryAuthority.id, methodId: casual.uuid, isEnabled: false,
  });

  it('Should throw an error in case of unknown CountryAuthority', async () => {
    const dependencies: UpdateCountryAuthorityMethodStatusServiceOptions = {
      countryAuthorityRepository: mock<CountryAuthorityRepository>({
        findOneOrThrow: jest.fn().mockRejectedValue(new NotFoundError('Country\'s authority not found', { id: '' })),
      }),
      countryAuthorityMethodRepository: mock<CountryAuthorityMethodRepository>({
        update: jest.fn().mockResolvedValue(undefined),
        findOneOrThrow: jest.fn().mockRejectedValue('Method not found'),
      }),
    };

    const service = new UpdateCountryAuthorityMethodStatusService(dependencies);

    await expect(service.execute(payload)).rejects.toThrow('Country\'s authority not found');
    expect(dependencies.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(payload.authority, payload.country);
    expect(dependencies.countryAuthorityMethodRepository.findOneOrThrow).not.toHaveBeenCalled();
    expect(dependencies.countryAuthorityMethodRepository.findOneOrThrow).not.toHaveBeenCalled();
  });

  it('Should throw an error in case of unknown CountryAuthorityMethod', async () => {
    const dependencies: UpdateCountryAuthorityMethodStatusServiceOptions = {
      countryAuthorityRepository: mock<CountryAuthorityRepository>({
        findOneOrThrow: jest.fn().mockResolvedValue(countryAuthority),
      }),
      countryAuthorityMethodRepository: mock<CountryAuthorityMethodRepository>({
        runInTransaction: jest.fn().mockRejectedValue(new NotFoundError('Payment Method not found', { id: '' })),
      }),
    };

    const service = new UpdateCountryAuthorityMethodStatusService(dependencies);

    await expect(service.execute(payload)).rejects.toThrow('Payment Method not found');
  });

  it('Should return updated status on success', async () => {
    const dependencies: UpdateCountryAuthorityMethodStatusServiceOptions = {
      countryAuthorityRepository: mock<CountryAuthorityRepository>({
        findOneOrThrow: jest.fn().mockResolvedValue(countryAuthority),
      }),
      countryAuthorityMethodRepository: mock<CountryAuthorityMethodRepository>({
        update: jest.fn().mockResolvedValue({ ...method, isEnabled: payload.isEnabled }),
        findOneOrThrow: jest.fn().mockResolvedValue(method),
        runInTransaction: jest.fn().mockImplementation(fn => fn(tx)),
      }),
    };

    const service = new UpdateCountryAuthorityMethodStatusService(dependencies);
    const result = await service.execute(payload);

    expect(dependencies.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(payload.authority, payload.country);
    expect(dependencies.countryAuthorityMethodRepository.runInTransaction).toBeCalledOnceWith(expect.any(Function));
    expect(dependencies.countryAuthorityMethodRepository.findOneOrThrow)
      .toBeCalledOnceWith(countryAuthority.id, payload.methodCode, tx);
    expect(dependencies.countryAuthorityMethodRepository.update).toBeCalledOnceWith(method.id, { isEnabled: payload.isEnabled }, tx);
    expect(result).toStrictEqual({ isEnabled: payload.isEnabled });
  });
});
