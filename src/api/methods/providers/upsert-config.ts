import { UpsertConfigService } from '@domains/providers/use-cases';
import { Paths } from '@typings/openapi';
import { UpsertConfigServiceResponse } from '@domains/providers/types/contracts';
import { THttpMethod } from '@internal/core-library';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpsertConfig.RequestBody,
  void,
  UpsertConfigServiceResponse
> = async (req, res) => {
  const service = req.container.resolve<UpsertConfigService>(UpsertConfigService.name);
  const response = await service.execute(req.body);

  return res.send(response).status(200).end();
};

export const upsertConfig = withAuthorization([Roles.ADMIN], controller);
