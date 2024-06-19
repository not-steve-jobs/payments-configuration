import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { GetProviderSettingsService, ProviderSettingsResponse } from '@domains/providers';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  Paths.GetProviderSettings.PathParameters,
  ProviderSettingsResponse
> = async (req, res) => {
  const service = req.container.resolve<GetProviderSettingsService>(GetProviderSettingsService.name);
  const response = await service.execute({ providerCode: req.params.code });

  return res.send(response).status(200).end();
};

export const getProviderSettings = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
