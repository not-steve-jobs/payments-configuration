import { UpdateBankAccounts } from '@domains/providers';
import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { BankAccountsData, BankAccountsGroupedData } from '@core';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateProviderBankAccounts.RequestBody,
  Paths.UpdateProviderBankAccounts.PathParameters,
  BankAccountsData
> = async (req, res) => {
  const service = req.container.resolve<UpdateBankAccounts>(UpdateBankAccounts.name);
  const response = await service.execute({
    providerCode: req.params.code,
    bankAccountsData: req.body.bankAccountsData as BankAccountsGroupedData[],
  });

  return res.send(response).status(200).end();
};

export const updateProviderBankAccounts = withAuthorization([Roles.ADMIN], controller);
