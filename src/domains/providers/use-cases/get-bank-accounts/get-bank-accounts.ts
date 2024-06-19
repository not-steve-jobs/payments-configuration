import { BankAccountsData, Cache, UseCase } from '@core';
import { BankAccountsRepository, ProviderRepository } from '@infra';
import { GetBankAccountsParams } from '@domains/providers';
import { BankAccountsDataGroupMapper, BankAccountsDataMapper } from '@domains/providers/mappers';

export interface GetBankAccountsOptions {
  bankAccountsRepository: BankAccountsRepository;
  providerRepository: ProviderRepository;
}

export class GetBankAccounts extends UseCase<
  GetBankAccountsParams,
  BankAccountsData
> {
  private readonly bankAccountsRepository: BankAccountsRepository;
  private readonly providerRepository: ProviderRepository;

  constructor(options: GetBankAccountsOptions) {
    super(options);
    this.bankAccountsRepository = options.bankAccountsRepository;
    this.providerRepository = options.providerRepository;
  }

  @Cache()
  public async execute({ providerCode }: GetBankAccountsParams): Promise<BankAccountsData> {
    await this.providerRepository.findOneOrThrow({ code: providerCode });
    const bankAccountDtos = await this.bankAccountsRepository.findAllBankAccounts({ providerCode });
    const bankAccountsData = BankAccountsDataMapper.mapToBankAccountData(bankAccountDtos);

    return { bankAccountsData: BankAccountsDataGroupMapper.dataListToGroup(bankAccountsData) };
  }
}
