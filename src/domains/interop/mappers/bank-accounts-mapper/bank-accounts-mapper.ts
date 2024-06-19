import { BankAccountEntity } from '@core/contracts/infrastructure/entities';
import { BankAccountDto } from '@domains/interop/types';

export class BankAccountsMapper {
  public static mapToBankAccountsDto(bankAccounts: BankAccountEntity[]): BankAccountDto[] {
    return bankAccounts.reduce((acc, next) => {
      acc.push({ name: next.name, type: next.type, config: JSON.parse(next.configs) });

      return acc;
    }, [] as BankAccountDto[]);
  }
}
