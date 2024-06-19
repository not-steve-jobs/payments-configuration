import { GetCurrenciesService } from '@domains/currencies';
import { THttpMethod } from '@internal/core-library';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  void,
  string[]
> = async (req, res) => {
  const service = req.container.resolve<GetCurrenciesService>(GetCurrenciesService.name);
  const response = await service.execute();

  return res.send(response).status(200).end();
};

export const getCurrencies = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
