import { THttpMethod } from '@internal/core-library';
import { GetProviderMethodConfigsService, GetProviderMethodConfigsServiceParams, ProviderConfig } from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  GetProviderMethodConfigsServiceParams,
  ProviderConfig[]
> = async (req, res) => {
  const params: GetProviderMethodConfigsServiceParams = {
    methodCode: req.params.methodCode,
    country: req.query.country,
    authority: req.query.authority,
  };

  const service = req.container.resolve<GetProviderMethodConfigsService>(GetProviderMethodConfigsService.name);
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};

export const getProviderMethodConfigs = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
