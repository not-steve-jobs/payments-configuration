import casual from 'casual';

import { BankAccountEntity } from '@core/contracts/infrastructure/entities';

import { BankAccountsMapper } from './bank-accounts-mapper';

describe('BankAccountsMapper', () => {
  it('Should map to bankAccountDto', () => {
    const accounts = mock<BankAccountEntity[]>([
      { providerCode: casual.string, configs: JSON.stringify([]), type: casual.string, name: casual.string },
      { providerCode: casual.string, configs: JSON.stringify([]), type: casual.string, name: casual.string },
    ]);

    const response = BankAccountsMapper.mapToBankAccountsDto(accounts);

    expect(response).toStrictEqual([
      { name: accounts[0].name, type: accounts[0].type, config: [] },
      { name: accounts[1].name, type: accounts[1].type, config: [] },
    ]);
  });
});
