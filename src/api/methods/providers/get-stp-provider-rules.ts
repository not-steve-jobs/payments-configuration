import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { GetStpProviderRules, StpProviderRulesWithCaDto } from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.GetStpProviderRules.PathParameters,
  void,
  StpProviderRulesWithCaDto[]
> = async (req, res) => {
  const service = req.container.resolve<GetStpProviderRules>(GetStpProviderRules.name);
  const response = await service.execute(req.params.code);

  return res.send(response).status(200).end();
};

export const getStpProviderRules = withAuthorization([Roles.ADMIN, Roles.VIEWER], controller);
