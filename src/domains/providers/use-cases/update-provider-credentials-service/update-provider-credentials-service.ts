import { UseCase } from '@core';
import {
  AuthorityRepository,
  CountryRepository,
  CredentialsRepository,
  CurrencyRepository,
  PaymentGatewayService,
  ProviderMethodRepository,
  ProviderRepository,
} from '@infra';
import { CredentialsFactory } from '@domains/providers/factories';
import {
  CredentialsData, CredentialsDataParameters, CredentialsGroupedData, GetProviderCredentialsServiceResponse,
  UpdateProviderCredentialsServiceParams,
  UpdateProviderCredentialsServiceResponse,
} from '@domains/providers/types';
import {
  CredentialsDataGroupMapper,
  CredentialsDataMapper,
  PspCredentialsDataMapper,
} from '@domains/providers/mappers';
import { BaseError, NotFoundError } from '@internal/errors-library';

import { CredentialsValidator } from './validators';

export interface UpdateProviderCredentialsServiceOptions {
  credentialsRepository: CredentialsRepository;
  currencyRepository: CurrencyRepository;
  countryRepository: CountryRepository;
  authorityRepository: AuthorityRepository;
  providerRepository: ProviderRepository;
  providerMethodRepository: ProviderMethodRepository;
  paymentGatewayService: PaymentGatewayService;
}

export class UpdateProviderCredentialsService extends UseCase<
  UpdateProviderCredentialsServiceParams,
  UpdateProviderCredentialsServiceResponse
> {
  private readonly credentialsRepository: CredentialsRepository;
  private readonly currencyRepository: CurrencyRepository;
  private readonly providerRepository: ProviderRepository;
  private readonly paymentGatewayService: PaymentGatewayService;
  private readonly providerMethodRepository: ProviderMethodRepository;

  constructor(options: UpdateProviderCredentialsServiceOptions) {
    super(options);
    this.credentialsRepository = options.credentialsRepository;
    this.currencyRepository = options.currencyRepository;
    this.providerRepository = options.providerRepository;
    this.paymentGatewayService = options.paymentGatewayService;
    this.providerMethodRepository = options.providerMethodRepository;
  }

  public async execute({ providerCode, credentialsData }: UpdateProviderCredentialsServiceParams): Promise<UpdateProviderCredentialsServiceResponse> {
    try {
      if (this.paymentGatewayService.isEnabled() && await this.paymentGatewayService.checkExistence(providerCode)) {
        return await this.updatePspCredentials(providerCode, credentialsData);
      }
    } catch (error: unknown) {
      const e = error as BaseError;
      throw new BaseError(`PSP error: ${e.message}`, { ...e });
    }

    return this.updateLocalCredentials(providerCode, credentialsData);
  }

  private async updatePspCredentials(providerCode: string, credentialsData: CredentialsGroupedData[]): Promise<UpdateProviderCredentialsServiceResponse> {
    await this.paymentGatewayService.updateCredentials(providerCode, PspCredentialsDataMapper.mapToPspCredentials(credentialsData));
    return this.getPspCredentials(providerCode);
  }

  private async getPspCredentials(providerCode: string): Promise<GetProviderCredentialsServiceResponse> {
    const pspCredentials = await this.paymentGatewayService.getCredentials(providerCode);
    const credentialsData = PspCredentialsDataMapper.mapToCredentialsData(pspCredentials);
    return { credentialsData: CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData) };
  }

  private async updateLocalCredentials(providerCode: string, credentialsData: CredentialsGroupedData[]): Promise<UpdateProviderCredentialsServiceResponse> {
    await this.providerRepository.findOneOrThrow({ code: providerCode });

    const credentialsDataList = CredentialsDataGroupMapper.groupToCredentialDataList(credentialsData);
    CredentialsValidator.validate(credentialsDataList, {
      countriesAuthoritiesBounded: await this.providerMethodRepository.findCABoundedToProvider(providerCode),
    });

    this.upperifyParameters(credentialsDataList);
    await this.checkInvariants(credentialsDataList);
    const credentialsToUpdate = CredentialsFactory.createUpdateEntities(providerCode, credentialsDataList);
    const credentials = await this.credentialsRepository.updateCredentials(providerCode, credentialsToUpdate);

    const credentialsDataListAfterUpdate = CredentialsDataMapper.mapToCredentialsData(credentials);
    return { credentialsData: CredentialsDataGroupMapper.credentialDataListToGroup(credentialsDataListAfterUpdate) };
  }

  private getAllDataParameters(credentialsDataList: CredentialsData[], key: keyof CredentialsDataParameters): string[] {
    return Array.from(new Set<string>(credentialsDataList
      .flatMap(cd => cd.parameters[key] || '')
      .filter(v => v.length > 0)));
  }

  private async checkCurrencies(currenciesToUpdate: string[]): Promise<void | never> {
    const currencies = (await this.currencyRepository.findAll({ params: { iso3: currenciesToUpdate } })).map(c => c.iso3);

    const unknown = currenciesToUpdate.find(c => !currencies.includes(c.toUpperCase()));

    if (unknown) {
      throw new NotFoundError('Unknown currency', { id: { iso3: unknown } });
    }
  }

  private async checkInvariants(credentialsDataList: CredentialsData[]): Promise<void | never> {
    const currenciesToUpdate = this.getAllDataParameters(credentialsDataList, 'currency');
    if (currenciesToUpdate.length) {
      await this.checkCurrencies(currenciesToUpdate);
    }
  }

  private upperifyParameters(credentialsDataList: CredentialsData[]): void {
    credentialsDataList.forEach(({ parameters }) =>
      Object.keys(parameters).forEach(key => parameters[key] = parameters[key]?.toUpperCase())
    );
  }
}
