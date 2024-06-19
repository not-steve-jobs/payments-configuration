import {
  CredentialsGroupedData,
  UpdateProviderCredentialsService,
  UpdateProviderCredentialsServiceResponse,
} from '@domains/providers';
import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateProviderCredentials.RequestBody,
  Paths.UpdateProviderCredentials.PathParameters,
  UpdateProviderCredentialsServiceResponse
> = async (req, res) => {
  const service = req.container.resolve<UpdateProviderCredentialsService>(UpdateProviderCredentialsService.name);
  const response = await service.execute({
    providerCode: req.params.code,
    credentialsData: req.body.credentialsData as CredentialsGroupedData[],
  });

  return res.send(response).status(200).end();
};

export const updateProviderCredentials = withAuthorization([Roles.ADMIN], controller);
