import { THttpMethod } from '@internal/core-library';
import {
  UpdateWithdrawalsOrder,
} from '@domains/provider-methods';
import {
  UpdateWithdrawalsOrderParams,
} from '@domains/provider-methods/use-cases/update-withdrawals-order/types';
import { Paths } from '@typings/openapi';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateWithdrawalsOrder.RequestBody,
  Paths.UpdateWithdrawalsOrder.QueryParameters,
  Paths.UpdateWithdrawalsOrder.Responses.$200
> = async (req, res) => {
  const params: UpdateWithdrawalsOrderParams = {
    country: req.query.country,
    authority: req.query.authority,
    withdrawals: req.body,
  };

  const useCase = req.container.resolve<UpdateWithdrawalsOrder>(UpdateWithdrawalsOrder.name);
  const response = await useCase.execute(params);

  return res.send(response).status(200).end();
};

export const updateWithdrawalsOrder = withAuthorization([Roles.ADMIN], controller);
