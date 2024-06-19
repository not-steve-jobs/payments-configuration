import { UpdateProviderCredentialsServiceParams } from '../../types';

import {
  UpdateProviderCredentialsService,
  UpdateProviderCredentialsServiceOptions,
} from './update-provider-credentials-service';

describe('UpdateProviderCredentialsService', () => {
  it('Should return empty array', async () => {
    const params: UpdateProviderCredentialsServiceParams = { providerCode: 'test', credentialsData: [] };
    const options = mock<UpdateProviderCredentialsServiceOptions>({
      credentialsRepository: { updateCredentials: jest.fn().mockResolvedValue([]) },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      providerMethodRepository: { findCABoundedToProvider: jest.fn().mockResolvedValue([]) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(false),
        checkExistence: jest.fn().mockResolvedValue(false),
        updateCredentials: jest.fn().mockResolvedValue({}),
      },
    });

    const service = new UpdateProviderCredentialsService(options);
    const response = await service.execute(params);

    expect(options.credentialsRepository.updateCredentials).toBeCalledOnceWith('test', []);
    expect(response).toStrictEqual({ credentialsData: [] });
  });

  it('Should return updated credentials', async () => {
    const params: UpdateProviderCredentialsServiceParams = { providerCode: 'test', credentialsData: [] };
    const options = mock<UpdateProviderCredentialsServiceOptions>({
      credentialsRepository: { updateCredentials: jest.fn().mockResolvedValue([
        { providerCode: params.providerCode, authorityFullCode: null, countryIso2: null, currencyIso3: null, credentialsDetails: [{ key: 'one', value: '1' }] },
      ]) },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(false),
        checkExistence: jest.fn().mockResolvedValue(false),
        updateCredentials: jest.fn().mockResolvedValue({}),
      },
      providerMethodRepository: { findCABoundedToProvider: jest.fn().mockResolvedValue([]) },
    });

    const service = new UpdateProviderCredentialsService(options);

    expect(await service.execute(params)).toStrictEqual({
      credentialsData: [{ parameters: {}, credentialsDetails: [{ key: 'one', value: '1' }] }],
    });
    expect(options.credentialsRepository.updateCredentials).toBeCalledOnceWith('test', []);
  });

  it('Should not call PSP: isEnabled = false, checkExistence = true', async () => {
    const params: UpdateProviderCredentialsServiceParams = { providerCode: 'test', credentialsData: [] };
    const options = mock<UpdateProviderCredentialsServiceOptions>({
      credentialsRepository: { updateCredentials: jest.fn().mockResolvedValue([]) },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(false),
        checkExistence: jest.fn().mockResolvedValue(true),
        updateCredentials: jest.fn().mockResolvedValue({}),
      },
      providerMethodRepository: { findCABoundedToProvider: jest.fn().mockResolvedValue([]) },
    });

    const service = new UpdateProviderCredentialsService(options);

    await service.execute(params);
    expect(options.paymentGatewayService.updateCredentials).toHaveBeenCalledTimes(0);
    expect(options.credentialsRepository.updateCredentials).toHaveBeenCalledTimes(1);
  });

  it('Should not call PSP: isEnabled = true, checkExistence = false', async () => {
    const params: UpdateProviderCredentialsServiceParams = { providerCode: 'test', credentialsData: [] };
    const options = mock<UpdateProviderCredentialsServiceOptions>({
      credentialsRepository: { updateCredentials: jest.fn().mockResolvedValue([]) },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(true),
        checkExistence: jest.fn().mockResolvedValue(false),
        updateCredentials: jest.fn().mockResolvedValue({}),
      },
      providerMethodRepository: { findCABoundedToProvider: jest.fn().mockResolvedValue([]) },
    });

    const service = new UpdateProviderCredentialsService(options);

    await service.execute(params);
    expect(options.paymentGatewayService.updateCredentials).toHaveBeenCalledTimes(0);
    expect(options.credentialsRepository.updateCredentials).toHaveBeenCalledTimes(1);
  });

  it('Update PSP credentials: isEnabled = true, checkExistence = true', async () => {
    const providerCode = 'test';
    const credentialsData = [
      { parameters: {}, credentialsDetails: [{ key: 'one', value: '1' } ] },
      {
        parameters: {
          countryAuthorities: [{ authority: 'GM', country: 'BY' }],
          currencies: ['USD', 'EUR'],
        },
        credentialsDetails: [{ key: 'two', value: '2' } ],
      },
    ];
    const unmappedCredentials = {
      credentialsData: [
        {
          parameters: {},
          credentialsDetails: {
            one: '1',
          },
        },
        {
          parameters: {
            authority: 'GM',
            country: 'BY',
            currency: 'USD',
          },
          credentialsDetails: {
            one: '1',
            two: '2',
          },
        },
        {
          parameters: {
            authority: 'GM',
            country: 'BY',
            currency: 'EUR',
          },
          credentialsDetails: {
            one: '1',
            two: '2',
          },
        },
      ],
    };

    const options = mock<UpdateProviderCredentialsServiceOptions>({
      credentialsRepository: { updateCredentials: jest.fn().mockResolvedValue([]) },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(true),
        checkExistence: jest.fn().mockResolvedValue(true),
        updateCredentials: jest.fn().mockResolvedValue({}),
        getCredentials: jest.fn().mockResolvedValue(unmappedCredentials),
      },
    });
    const params: UpdateProviderCredentialsServiceParams = { providerCode, credentialsData };

    const service = new UpdateProviderCredentialsService(options);
    const response = await service.execute(params);

    expect(options.credentialsRepository.updateCredentials).toHaveBeenCalledTimes(0);
    expect(response).toStrictEqual({ credentialsData: [
      { parameters: {}, credentialsDetails: [{ key: 'one', value: '1' } ] },
      {
        parameters: {
          countryAuthorities: [{ authority: 'GM', country: 'BY' }],
          currencies: ['USD', 'EUR'],
        },
        credentialsDetails: [{ key: 'one', value: '1' }, { key: 'two', value: '2' }],
      },
    ] });
  });
});
