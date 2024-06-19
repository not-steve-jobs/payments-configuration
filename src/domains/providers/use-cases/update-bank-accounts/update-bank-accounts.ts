import { BankAccountsData, UseCase } from '@core';
import { BankAccountsRepository, CurrencyRepository, ProviderMethodRepository, ProviderRepository } from '@infra';
import { UpdateBankAccountsParams } from '@domains/providers';
import { BankAccountsDataGroupMapper, BankAccountsDataMapper } from '@domains/providers/mappers';
import { BankAccountsFactory } from '@domains/providers/factories/bank-accounts-factory';

import { BankAccountsValidator } from './validators';

export interface UpdateBankAccountsOptions {
  bankAccountsRepository: BankAccountsRepository;
  providerRepository: ProviderRepository;
  providerMethodRepository: ProviderMethodRepository;
  currencyRepository: CurrencyRepository;
}

export class UpdateBankAccounts extends UseCase<
  UpdateBankAccountsParams,
  BankAccountsData
> {
  private readonly bankAccountsRepository: BankAccountsRepository;
  private readonly providerRepository: ProviderRepository;
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly currencyRepository: CurrencyRepository;

  constructor(options: UpdateBankAccountsOptions) {
    super(options);
    this.bankAccountsRepository = options.bankAccountsRepository;
    this.providerRepository = options.providerRepository;
    this.providerMethodRepository = options.providerMethodRepository;
    this.currencyRepository = options.currencyRepository;
  }

  public async execute({ providerCode, bankAccountsData }: UpdateBankAccountsParams): Promise<BankAccountsData> {
    await this.providerRepository.findOneOrThrow({ code: providerCode });

    const boundedCAs = await this.providerMethodRepository.findCABoundedToProvider(providerCode);
    const existingCurrencies = await this.currencyRepository.findAllIso3();
    BankAccountsValidator.validate(bankAccountsData, { boundedCAs, existingCurrencies });

    const bankAccountData = BankAccountsDataGroupMapper.groupToDataList(bankAccountsData);
    const updateEntities = BankAccountsFactory.createUpdateEntities(providerCode, bankAccountData);

    const bankAccountsAfterUpdate = await this.bankAccountsRepository.replaceBankAccounts(providerCode, updateEntities);

    const bankAccountsDataAfterUpdate = BankAccountsDataMapper.mapToBankAccountData(bankAccountsAfterUpdate);
    return { bankAccountsData: BankAccountsDataGroupMapper.dataListToGroup(bankAccountsDataAfterUpdate) };
  }
}
