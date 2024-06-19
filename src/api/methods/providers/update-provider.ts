import { THttpMethod } from '@internal/core-library';
import { Components, Paths } from '@typings/openapi';
import { UpdateProviderService } from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateProvider.RequestBody,
  Paths.UpdateProvider.PathParameters,
  Components.Schemas.Provider
> = async (req, res) => {
  const service = req.container.resolve<UpdateProviderService>(UpdateProviderService.name);
  const response = await service.execute({ providerCode: req.params.code, data: req.body });

  return res.send(response).status(200).end();
};

export const updateProvider = withAuthorization([Roles.ADMIN], controller);
