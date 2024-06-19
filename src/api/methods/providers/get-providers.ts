import { THttpMethod } from '@internal/core-library';
import { GetProvidersService } from '@domains/providers';
import { ProviderBaseDto } from '@core';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<unknown, void, ProviderBaseDto[]> = async (req, res) => {
  const service = req.container.resolve<GetProvidersService>(GetProvidersService.name);
  const response = await service.execute();

  return res.send(response).status(200).end();
};

export const getProviders = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
