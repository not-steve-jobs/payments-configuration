import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { ProviderRestrictionsGroupDto, UpdateProviderRestrictions } from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  ProviderRestrictionsGroupDto[],
  Paths.UpdateProviderRestrictions.PathParameters,
  ProviderRestrictionsGroupDto[]
> = async (req, res) => {
  const service = req.container.resolve<UpdateProviderRestrictions>(UpdateProviderRestrictions.name);
  const result = await service.execute({ providerCode: req.params.code, restrictions: req.body });

  return res.send(result).status(200).end();
};

export const updateProviderRestrictions = withAuthorization([Roles.ADMIN], controller);
