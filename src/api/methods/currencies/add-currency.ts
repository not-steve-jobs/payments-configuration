import { AddCurrency } from '@domains/currencies';
import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.AddCurrency.RequestBody,
  void,
  Paths.AddCurrency.Responses.$200
> = async (req, res) => {
  const service = req.container.resolve<AddCurrency>(AddCurrency.name);
  const response = await service.execute(req.body);

  return res.send(response).status(200).end();
};

export const addCurrency = withAuthorization([Roles.ADMIN], controller);
