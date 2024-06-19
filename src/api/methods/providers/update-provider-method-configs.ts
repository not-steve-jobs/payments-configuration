import { THttpMethod } from '@internal/core-library';
import {
  ProviderConfig,
  UpdateProviderMethodConfig,
  UpdateProviderMethodConfigsService,
  UpdateProviderMethodConfigsServiceParams,
} from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  UpdateProviderMethodConfig[],
  UpdateProviderMethodConfigsServiceParams,
  ProviderConfig[]
> = async (req, res) => {
  const providerConfigs = req.body;

  const params: UpdateProviderMethodConfigsServiceParams = {
    country: req.query.country,
    authority: req.query.authority,
    methodCode: req.params.methodCode,
    providerConfigs,
    author: 'unknown',
  };

  const service = req.container.resolve<UpdateProviderMethodConfigsService>(UpdateProviderMethodConfigsService.name);
  const response = await service.execute(params);
  return res.send(response).status(200).end();
};

export const updateProviderMethodConfigs = withAuthorization([Roles.ADMIN], controller);
