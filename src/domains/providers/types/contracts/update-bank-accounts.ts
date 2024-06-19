import { BankAccountsGroupedData } from '@core';

export interface UpdateBankAccountsParams {
  providerCode: string;
  bankAccountsData: BankAccountsGroupedData[];
}
