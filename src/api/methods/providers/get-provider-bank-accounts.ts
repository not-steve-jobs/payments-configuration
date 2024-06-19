import { GetBankAccounts } from '@domains/providers';
import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { BankAccountsData } from '@core';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  Paths.GetProviderCredentials.PathParameters,
  BankAccountsData
> = async (req, res) => {
  const service = req.container.resolve<GetBankAccounts>(GetBankAccounts.name);
  const response = await service.execute({ providerCode: req.params.code });

  return res.send(response).status(200).end();
};

export const getProviderBankAccounts = withAuthorization([Roles.ADMIN, Roles.VIEWER], controller);
