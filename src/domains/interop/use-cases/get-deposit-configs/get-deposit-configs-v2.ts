import {
  Cache,
  ProviderFieldsEntity,
  TransactionConfigDto,
  TransactionType,
  UseCase,
} from '@core';
import {
  DepositConfig,
  GetDepositConfigsParams,
  GetDepositConfigsServiceParams,
  PlatformVersionsRestrictionsService,
} from '@domains/interop';
import { ProviderFieldRepository, TransactionConfigRepository } from '@infra';
import { DepositConfigsMapper } from '@domains/interop/mappers';


export interface GetDepositConfigOptions {
  transactionConfigRepository: TransactionConfigRepository;
  providerFieldRepository: ProviderFieldRepository;
  platformVersionsRestrictionsService: PlatformVersionsRestrictionsService;
}

export class GetDepositConfigsV2 extends UseCase<GetDepositConfigsServiceParams, DepositConfig[]> {
  private readonly transactionConfigRepository: TransactionConfigRepository;
  private readonly providerFieldRepository: ProviderFieldRepository;
  private readonly platformVersionsRestrictionsService: PlatformVersionsRestrictionsService;

  constructor(options: GetDepositConfigOptions) {
    super(options);
    this.transactionConfigRepository = options.transactionConfigRepository;
    this.providerFieldRepository = options.providerFieldRepository;
    this.platformVersionsRestrictionsService = options.platformVersionsRestrictionsService;
  }

  public async execute(params: GetDepositConfigsParams): Promise<DepositConfig[]> {
    const [configs, { commonFields, depositFields } ] = await Promise.all([
      this.getConfigsWithRestrictions(params),
      this.getProviderFields(params),
    ]);

    return DepositConfigsMapper.createDepositConfigs({ depositTransactionConfigs: configs, commonFields, depositFields });
  }

  private async getConfigsWithRestrictions(params: GetDepositConfigsServiceParams): Promise<TransactionConfigDto[]> {
    const configs = await this.getConfigs(params.authority, params.country);

    return this.applyRestrictionsFilter(configs, params);
  }

  @Cache()
  private getConfigs(authority: string, country: string): Promise<TransactionConfigDto[]> {
    return this.transactionConfigRepository.getProviderTransactionConfigs({
      transactionType: TransactionType.DEPOSIT,
      authority,
      country,
      isCamAndPmEnabled: true,
      isTransactionsConfigEnabled: true,
    });
  }

  private async applyRestrictionsFilter(
    configs: TransactionConfigDto[],
    { authority, country, platform, version }: GetDepositConfigsServiceParams
  ): Promise<TransactionConfigDto[]> {
    const providerCodes = [...new Set(configs.map(({ providerCode }) => providerCode))];

    if (platform && version) {
      const allowed = await this.platformVersionsRestrictionsService.getAllowed({
        providerCodes,
        authority,
        country,
        platform,
        version,
      });

      return configs.filter(c => allowed.has(c.providerCode));
    }

    return configs;
  }

  @Cache()
  private async getProviderFields({ authority, country } : GetDepositConfigsServiceParams): Promise<{
    depositFields: ProviderFieldsEntity[];
    commonFields: ProviderFieldsEntity[];
  }> {
    const [depositFields, commonFields] = await Promise.all([
      this.providerFieldRepository.findAll({
        params: {
          authorityFullCode: authority,
          countryIso2: country,
          transactionType: TransactionType.DEPOSIT,
        },
      }),
      this.providerFieldRepository.findAll({
        params: {
          authorityFullCode: null,
          countryIso2: null,
          currencyIso3: null,
          transactionType: TransactionType.DEPOSIT,
        },
      }),
    ]);

    return { depositFields, commonFields };
  }
}
