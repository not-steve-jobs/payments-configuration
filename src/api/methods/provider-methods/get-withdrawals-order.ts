import { THttpMethod } from '@internal/core-library';
import { GetWithdrawalsOrder, WithdrawalsOrderRequestParams } from '@domains/provider-methods';
import { Paths } from '@typings/openapi';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  Paths.GetWithdrawalsOrder.QueryParameters,
  Paths.GetWithdrawalsOrder.Responses.$200
> = async (req, res) => {
  const params: WithdrawalsOrderRequestParams = {
    country: req.query.country,
    authority: req.query.authority,
  };

  const useCase = req.container.resolve<GetWithdrawalsOrder>(GetWithdrawalsOrder.name);
  const response = await useCase.execute(params);

  return res.send(response).status(200).end();
};

export const getWithdrawalsOrder = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
