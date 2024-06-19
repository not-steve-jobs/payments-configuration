import { Cache, ConfigFieldWithOptionDto, FieldEntityType, TransactionConfigDto, TransactionType, UseCase } from '@core';
import { FieldRepository, TransactionConfigRepository } from '@infra';
import { DepositConfig, GetDepositConfigsServiceParams } from '@domains/interop/types/contracts';
import { PlatformVersionsRestrictionsService } from '@domains/interop/services';
import { DepositConfigsFactory } from '@domains/interop/factories';

export interface GetDepositConfigServiceOptions {
  transactionConfigRepository: TransactionConfigRepository;
  fieldRepository: FieldRepository;
  platformVersionsRestrictionsService: PlatformVersionsRestrictionsService;
}

export class GetDepositConfigsService extends UseCase<GetDepositConfigsServiceParams, DepositConfig[]> {
  private readonly transactionConfigRepository: TransactionConfigRepository;
  private readonly fieldRepository: FieldRepository;
  private readonly platformVersionsRestrictionsService: PlatformVersionsRestrictionsService;

  constructor(options: GetDepositConfigServiceOptions) {
    super(options);
    this.transactionConfigRepository = options.transactionConfigRepository;
    this.fieldRepository = options.fieldRepository;
    this.platformVersionsRestrictionsService = options.platformVersionsRestrictionsService;
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
  private getConfigs(authority: string, country: string): Promise<TransactionConfigDto[]> {
    return this.transactionConfigRepository.getProviderTransactionConfigs({
      transactionType: TransactionType.DEPOSIT,
      authority,
      country,
      isCamAndPmEnabled: true,
      isTransactionsConfigEnabled: true,
    });
  }

  private async getConfigsWithRestrictions(params: GetDepositConfigsServiceParams): Promise<TransactionConfigDto[]> {
    const configs = await this.getConfigs(params.authority, params.country);

    return this.applyRestrictionsFilter(configs, params);
  }

  private getFieldsEntityIds(configs: TransactionConfigDto[]): string[] {
    return Array.from(configs.reduce((acc, { providerId, providerMethodId }) => {
      acc.add(providerId);
      acc.add(providerMethodId);
      return acc;
    }, new Set<string>()));
  }

  @Cache()
  private async getFieldsOptions(entityIds: string[]): Promise<{
    commonFieldOptions: ConfigFieldWithOptionDto[];
    depositFieldOptions: ConfigFieldWithOptionDto[];
  }> {
    const fieldOptions = await this.fieldRepository.findFieldsWithOptions({
      entityIds,
      getOnlyCommonCurrencyFields: true,
      transactionType: TransactionType.DEPOSIT,
      isEnabled: true,
    });

    return fieldOptions.reduce((acc, f) => {
      if (f.entityType === FieldEntityType.PROVIDER_METHOD) {
        acc.depositFieldOptions.push(f);
      } else {
        acc.commonFieldOptions.push(f);
      }

      return acc;
    }, { commonFieldOptions: [] as ConfigFieldWithOptionDto[], depositFieldOptions: [] as ConfigFieldWithOptionDto[] } );
  }

  public async execute(params: GetDepositConfigsServiceParams): Promise<DepositConfig[]> {
    const configs = await this.getConfigsWithRestrictions(params);
    const fieldsEntityIds = this.getFieldsEntityIds(configs);
    const { commonFieldOptions, depositFieldOptions } = await this.getFieldsOptions(fieldsEntityIds);

    return DepositConfigsFactory.createDepositConfigs({ depositTransactionConfigs: configs, depositFieldOptions, commonFieldOptions });
  }
}
