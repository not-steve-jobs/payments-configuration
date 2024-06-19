import { Cache, CountryAuthorityEntity, UseCase } from '@core';
import { CredentialsRepository, PaymentGatewayService, ProviderMethodRepository, ProviderRepository } from '@infra';
import {
  CredentialsData,
  GetProviderCredentialsServiceParams,
  GetProviderCredentialsServiceResponse,
} from '@domains/providers/types';
import { CredentialsDataGroupMapper, CredentialsDataMapper  } from '@domains/providers/mappers';
import {
  PspCredentialsDataMapper,
} from '@domains/providers/mappers/credentials-data-mapper/psp-credentials-data-mapper';
import { buildKey, isDefaultCredentials } from '@utils';

export interface GetProviderCredentialsServiceOptions {
  credentialsRepository: CredentialsRepository;
  paymentGatewayService: PaymentGatewayService;
  providerRepository: ProviderRepository;
  providerMethodRepository: ProviderMethodRepository;
}

export class GetProviderCredentialsService extends UseCase<
  GetProviderCredentialsServiceParams,
  GetProviderCredentialsServiceResponse
> {
  private readonly credentialsRepository: CredentialsRepository;
  private readonly paymentGatewayService: PaymentGatewayService;
  private readonly providerRepository: ProviderRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;

  constructor(options: GetProviderCredentialsServiceOptions) {
    super(options);
    this.credentialsRepository = options.credentialsRepository;
    this.paymentGatewayService = options.paymentGatewayService;
    this.providerRepository = options.providerRepository;
    this.providerMethodRepository = options.providerMethodRepository;
  }

  @Cache()
  public async execute({ providerCode }: GetProviderCredentialsServiceParams): Promise<GetProviderCredentialsServiceResponse> {
    if (this.paymentGatewayService.isEnabled() && await this.paymentGatewayService.checkExistence(providerCode)) {
      return this.getPspCredentials(providerCode);
    }

    return this.getLocalCredentials(providerCode);
  }

  private async getPspCredentials(providerCode: string): Promise<GetProviderCredentialsServiceResponse> {
    const [pspCredentials, boundedCA] = await Promise.all([
      this.paymentGatewayService.getCredentials(providerCode),
      this.providerMethodRepository.findCABoundedToProvider(providerCode),
    ]);
    const credentialsData = PspCredentialsDataMapper.mapToCredentialsData(pspCredentials);
    const credentialsBoundedData = this.filterOnlyBoundedCountriesAuthorities(boundedCA, credentialsData);

    return { credentialsData: CredentialsDataGroupMapper.credentialDataListToGroup(credentialsBoundedData) };
  }

  private filterOnlyBoundedCountriesAuthorities(boundedCA: CountryAuthorityEntity[], credentialsData: CredentialsData[]): CredentialsData[] {
    const countryAuthoritySet = boundedCA.reduce((acc, next) => (acc.add(buildKey(next.authorityFullCode, next.countryIso2)), acc), new Set<string>());
    const credentialsDataToReturn: CredentialsData[] = [];

    for (const cd of credentialsData) {
      const key = buildKey(cd.parameters.authority!, cd.parameters.country!);
      const isBounded = isDefaultCredentials(cd.parameters) || countryAuthoritySet.has(key);

      if (isBounded) {
        credentialsDataToReturn.push(cd);
      }
    }

    return credentialsDataToReturn;
  };

  private async getLocalCredentials(providerCode: string): Promise<GetProviderCredentialsServiceResponse> {
    await this.providerRepository.findOneOrThrow({ code: providerCode });
    const credentials = await this.credentialsRepository.findAllCredentials({ providerCode });
    const credentialsData = CredentialsDataMapper.mapToCredentialsData(credentials);
    return { credentialsData: CredentialsDataGroupMapper.credentialDataListToGroup(credentialsData) };
  }
}
