import { THttpMethod } from '@internal/core-library';
import { GetPlatformVersions, GetPlatformVersionsResponse } from '@domains/mobile-platforms';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  void,
  GetPlatformVersionsResponse
> = async (req, res) => {
  const service = req.container.resolve<GetPlatformVersions>(GetPlatformVersions.name);
  const response = await service.execute();

  return res.send(response).status(200).end();
};

export const getPlatformVersions = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
