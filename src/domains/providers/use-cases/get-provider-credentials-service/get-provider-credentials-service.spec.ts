import {
  GetProviderCredentialsService,
  GetProviderCredentialsServiceOptions,
  GetProviderCredentialsServiceParams,
} from '@domains/providers';
import { PspCredentialsResponse } from '@infra';

describe('GetProviderCredentialsService', () => {
  it('Should not call PSP: isEnabled = false, checkExistence = true', async () => {
    const params: GetProviderCredentialsServiceParams = { providerCode: 'test' };
    const options = mock<GetProviderCredentialsServiceOptions>({
      credentialsRepository: { findAllCredentials: jest.fn().mockResolvedValue([]) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(false),
        checkExistence: jest.fn().mockResolvedValue(true),
        getCredentials: jest.fn().mockResolvedValue({}),
      },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
    });

    const service = new GetProviderCredentialsService(options);

    await service.execute(params);

    expect(options.paymentGatewayService.getCredentials).toHaveBeenCalledTimes(0);
    expect(options.credentialsRepository.findAllCredentials).toHaveBeenCalledTimes(1);
  });

  it('Should not call PSP: isEnabled = true, checkExistence = false', async () => {
    const params: GetProviderCredentialsServiceParams = { providerCode: 'test' };
    const options = mock<GetProviderCredentialsServiceOptions>({
      credentialsRepository: { findAllCredentials: jest.fn().mockResolvedValue([]) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(true),
        checkExistence: jest.fn().mockResolvedValue(false),
        getCredentials: jest.fn().mockResolvedValue({}),
      },
      providerRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue({}),
      },
    });

    const service = new GetProviderCredentialsService(options);

    await service.execute(params);

    expect(options.paymentGatewayService.getCredentials).toHaveBeenCalledTimes(0);
    expect(options.credentialsRepository.findAllCredentials).toHaveBeenCalledTimes(1);
  });

  it('Should return credentials from PSP: isEnabled = true, checkExistence = true', async () => {
    const pspCredentials: PspCredentialsResponse = {
      credentialsData: [
        {
          parameters: {
            authority: 'GM',
            country: 'BY',
            currency: 'USD',
          },
          credentialsDetails: {
            key1: 'value1',
            key2: 'value2',
          },
        },
        {
          parameters: {
            authority: 'GM',
            country: 'BY',
            currency: 'EUR',
          },
          credentialsDetails: {
            key1: 'value1',
            key2: 'value2',
          },
        },
      ],
    };

    const params: GetProviderCredentialsServiceParams = { providerCode: 'test' };
    const options = mock<GetProviderCredentialsServiceOptions>({
      credentialsRepository: { findAllCredentials: jest.fn().mockResolvedValue([]) },
      paymentGatewayService: {
        isEnabled: jest.fn().mockReturnValue(true),
        checkExistence: jest.fn().mockResolvedValue(true),
        getCredentials: jest.fn().mockResolvedValue(pspCredentials),
      },
      providerMethodRepository: {
        findCABoundedToProvider: jest.fn().mockResolvedValue([
          { authorityFullCode: 'GM', countryIso2: 'BY' },
        ]),
      },
    });
    const service = new GetProviderCredentialsService(options);

    const response = await service.execute(params);

    expect(options.credentialsRepository.findAllCredentials).toHaveBeenCalledTimes(0);
    expect(options.paymentGatewayService.getCredentials).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({
      credentialsData: [
        {
          parameters: {
            countryAuthorities: [{ authority: 'GM', country: 'BY' }],
            currencies: ['USD', 'EUR'],
          },
          credentialsDetails: [
            { key: 'key1', value: 'value1' },
            { key: 'key2', value: 'value2' },
          ],
        },
      ],
    });
  });

  it('Should return empty credentialsData', async () => {
    const providerCode = 'corefy';
    const options = mock<GetProviderCredentialsServiceOptions>({
      credentialsRepository: { findAllCredentials: jest.fn().mockResolvedValue([]) },
      paymentGatewayService: { isEnabled: jest.fn().mockReturnValue(false) },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
    });

    const service = new GetProviderCredentialsService(options);
    const response = await service.execute({ providerCode });

    expect(response).toStrictEqual({ credentialsData: [] });
    expect(options.credentialsRepository.findAllCredentials).toBeCalledOnceWith({ providerCode });
  });

  it('Should return credentialsData', async () => {
    const providerCode = 'corefy';
    const options = mock<GetProviderCredentialsServiceOptions>({
      credentialsRepository: {
        findAllCredentials: jest.fn().mockResolvedValue([
          { providerCode: 'corefy', authorityFullCode: null, countryIso2: null, currencyIso3: null, credentialsDetails: [{ key: 'one', value: '1' }] },
        ]),
      },
      paymentGatewayService: { isEnabled: jest.fn().mockReturnValue(false) },
      providerRepository: { findOneOrThrow: jest.fn().mockResolvedValue({}) },
    });

    const service = new GetProviderCredentialsService(options);
    const response = await service.execute({ providerCode });

    expect(response).toStrictEqual({
      credentialsData: [{ parameters: {}, credentialsDetails: [{ key: 'one', value: '1' }] }],
    });
    expect(options.credentialsRepository.findAllCredentials).toBeCalledOnceWith({ providerCode });
  });
});
