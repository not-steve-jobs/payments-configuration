import { BankAccountEntity, Cache, CredentialDto, ProviderFieldsEntity, TransactionConfigDto, UseCase } from '@core';
import { ConfigDto, GetConfigsServiceParams } from '@domains/interop/types';
import { ILogger } from '@internal/logger-library';
import { ConfigsMapper } from '@domains/interop/mappers';
import { BankAccountsRepository, CredentialsRepository, ProviderFieldRepository, TransactionConfigRepository } from '@infra/repos';

export interface GetConfigsServiceV2Options {
  transactionConfigRepository: TransactionConfigRepository;
  providerFieldRepository: ProviderFieldRepository;
  credentialsRepository: CredentialsRepository;
  bankAccountsRepository: BankAccountsRepository;
  logger: ILogger;
}

export class GetConfigsServiceV2 extends UseCase<GetConfigsServiceParams, ConfigDto[]> {
  private readonly transactionConfigRepository: TransactionConfigRepository;
  private readonly providerFieldRepository: ProviderFieldRepository;
  private readonly credentialsRepository: CredentialsRepository;
  private readonly bankAccountsRepository: BankAccountsRepository;

  constructor(options: GetConfigsServiceV2Options) {
    super(options);
    this.transactionConfigRepository = options.transactionConfigRepository;
    this.providerFieldRepository = options.providerFieldRepository;
    this.credentialsRepository = options.credentialsRepository;
    this.bankAccountsRepository = options.bankAccountsRepository;
  }

  private async findAllCredentials(providerCodes: string[], authorityFullCode: string, countryIso2: string): Promise<CredentialDto[]> {
    return await this.credentialsRepository.findAllByAuthorityAndCountry(providerCodes, authorityFullCode, countryIso2);
  }

  private async findAllBankAccounts(providerCodes: string[], authorityFullCode: string, countryIso2: string): Promise<BankAccountEntity[]> {
    return await this.bankAccountsRepository.findAllByAuthorityAndCountry(providerCodes, authorityFullCode, countryIso2);
  }

  private async findConfigs(country: string, authority: string): Promise<TransactionConfigDto[]> {
    return await this.transactionConfigRepository.getProviderTransactionConfigs({ country, authority, isCamAndPmEnabled: true });
  }

  private async findFields(providerCodes: string[]): Promise<ProviderFieldsEntity[]> {
    return await this.providerFieldRepository.findAll({
      params: { providerCode: providerCodes },
      order: ['countryIso2', 'authorityFullCode', 'transactionType', 'currencyIso3'],
    });
  }

  @Cache()
  public async execute(payload: GetConfigsServiceParams): Promise<ConfigDto[]> {
    const configs = await this.findConfigs(payload.country, payload.authority);
    const providerCodes = Array.from(new Set<string>(configs.map(({ providerCode }) => providerCode)));

    const [credentials, bankAccounts, providersFields] = await Promise.all([
      this.findAllCredentials(providerCodes, payload.authority, payload.country),
      this.findAllBankAccounts(providerCodes, payload.authority, payload.country),
      this.findFields(providerCodes),
    ]);

    return ConfigsMapper.mapToConfigsDto(configs, {
      country: payload.country,
      authority: payload.authority,
      credentials,
      bankAccounts,
      providersFields,
    });
  }
}
