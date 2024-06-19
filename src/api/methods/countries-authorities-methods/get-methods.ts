import { THttpMethod } from '@internal/core-library';
import { GetMethods, GetMethodsResponse } from '@domains/countries-authorities-methods';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  void,
  GetMethodsResponse
> = async (req, res) => {
  const useCase = req.container.resolve<GetMethods>(GetMethods.name);
  const response = await useCase.execute();

  return res.send(response).status(200).end();
};

export const getMethods = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
