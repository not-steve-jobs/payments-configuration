import { THttpMethod } from '@internal/core-library';
import { Components } from '@typings/openapi';
import { SyncPlatformVersions } from '@domains/mobile-platforms';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  void,
  Components.Schemas.SyncResponse
> = async (req, res) => {
  const service = req.container.resolve<SyncPlatformVersions>(SyncPlatformVersions.name);
  const response = await service.execute();

  return res.send(response).status(200).end();
};

export const syncPlatformVersions = withAuthorization([Roles.ADMIN], controller);
