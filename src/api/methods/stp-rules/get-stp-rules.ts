import { GetStpRules } from '@domains/stp-rules';
import { THttpMethod } from '@internal/core-library';
import { StpRuleDto } from '@core/contracts/dtos/stp-rule-dto';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  void,
  StpRuleDto[]
> = async (req, res) => {
  const service = req.container.resolve<GetStpRules>(GetStpRules.name);
  const response = await service.execute();

  return res.send(response).status(200).end();
};

export const getStpRules = withAuthorization([Roles.ADMIN, Roles.VIEWER], controller);
