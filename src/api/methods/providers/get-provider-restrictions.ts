import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { GetProviderRestrictions } from '@domains/providers/use-cases/get-provider-restrictions';
import { ProviderRestrictionsGroupDto } from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateProviderCredentials.RequestBody,
  Paths.UpdateProviderCredentials.PathParameters,
  ProviderRestrictionsGroupDto[]
> = async (req, res) => {
  const service = req.container.resolve<GetProviderRestrictions>(GetProviderRestrictions.name);
  const result = await service.execute(req.params.code);

  return res.send(result).status(200).end();
};

export const getProviderRestrictions = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
