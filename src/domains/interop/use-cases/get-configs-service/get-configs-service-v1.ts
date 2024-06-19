import {
  BankAccountEntity,
  Cache,
  ConfigFieldWithOptionDto,
  CredentialDto,
  FieldEntityType,
  TransactionConfigDto,
  UseCase,
} from '@core';
import { ConfigsFactory } from '@domains/interop/factories';
import { ConfigDto, GetConfigsServiceParams } from '@domains/interop/types/contracts';
import { BankAccountsRepository, CredentialsRepository, FieldRepository, TransactionConfigRepository } from '@infra';
import { ILogger } from '@internal/logger-library';

export interface GetConfigsServiceV1Options {
  transactionConfigRepository: TransactionConfigRepository;
  fieldRepository: FieldRepository;
  credentialsRepository: CredentialsRepository;
  bankAccountsRepository: BankAccountsRepository;
  logger: ILogger;
}

export class GetConfigsServiceV1 extends UseCase<GetConfigsServiceParams, ConfigDto[]> {
  private readonly transactionConfigRepository: TransactionConfigRepository;
  private readonly fieldRepository: FieldRepository;
  private readonly credentialsRepository: CredentialsRepository;
  private readonly bankAccountsRepository: BankAccountsRepository;

  constructor(options: GetConfigsServiceV1Options) {
    super(options);
    this.transactionConfigRepository = options.transactionConfigRepository;
    this.fieldRepository = options.fieldRepository;
    this.credentialsRepository = options.credentialsRepository;
    this.bankAccountsRepository = options.bankAccountsRepository;
  }

  private getFieldsEntityIds(configs: TransactionConfigDto[]): string[] {
    return Array.from(configs.reduce((acc, { providerId, providerMethodId }) => {
      acc.add(providerId);
      acc.add(providerMethodId);
      return acc;
    }, new Set<string>()));
  }

  private async getFields(entityIds: string[]): Promise<{
    specificFields: ConfigFieldWithOptionDto[];
    commonFields: ConfigFieldWithOptionDto[];
  }> {
    const fields = await this.fieldRepository.findFieldsWithOptions({ entityIds, isEnabled: true });

    return fields.reduce((acc, f) => {
      if (f.entityType === FieldEntityType.PROVIDER_METHOD) {
        acc.specificFields.push(f);
      } else {
        acc.commonFields.push(f);
      }

      return acc;
    }, { specificFields: [] as ConfigFieldWithOptionDto[], commonFields: [] as ConfigFieldWithOptionDto[] });
  }

  private async findAllCredentials(providerCodes: string[], authorityFullCode: string, countryIso2: string): Promise<CredentialDto[]> {
    return await this.credentialsRepository.findAllByAuthorityAndCountry(providerCodes, authorityFullCode, countryIso2);
  }

  private async findAllBankAccounts(providerCodes: string[], authorityFullCode: string, countryIso2: string): Promise<BankAccountEntity[]> {
    return await this.bankAccountsRepository.findAllByAuthorityAndCountry(providerCodes, authorityFullCode, countryIso2);
  }

  private getConfigs(country: string, authority: string): Promise<TransactionConfigDto[]> {
    return this.transactionConfigRepository.getProviderTransactionConfigs({ country, authority, isCamAndPmEnabled: true });
  }

  @Cache()
  public async execute(payload: GetConfigsServiceParams): Promise<ConfigDto[]> {
    const configs = await this.getConfigs(payload.country, payload.authority);
    const providersCodes = Array.from(new Set<string>(configs.map(({ providerCode }) => providerCode)));
    const fieldsEntityIds = this.getFieldsEntityIds(configs);

    const [credentials, bankAccounts, { specificFields, commonFields }] = await Promise.all([
      this.findAllCredentials(providersCodes, payload.authority, payload.country),
      this.findAllBankAccounts(providersCodes, payload.authority, payload.country),
      this.getFields(fieldsEntityIds),
    ]);

    return ConfigsFactory.createConfigs(configs, {
      country: payload.country,
      authority: payload.authority,
      credentials,
      bankAccounts,
      specificFields,
      commonFields,
    });
  }
}
