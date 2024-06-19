import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { StpProviderRulesWithCaDto, UpdateStpProviderRules } from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateStpProviderRules.RequestBody,
  Paths.UpdateStpProviderRules.PathParameters,
  StpProviderRulesWithCaDto[]
> = async (req, res) => {
  const service = req.container.resolve<UpdateStpProviderRules>(UpdateStpProviderRules.name);
  const response = await service.execute({
    providerCode: req.params.code,
    stpProviderRules: req.body as StpProviderRulesWithCaDto[],
  });

  return res.send(response).status(200).end();
};

export const updateStpProviderRules = withAuthorization([Roles.ADMIN], controller);
