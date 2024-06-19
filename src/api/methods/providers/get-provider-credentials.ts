import { GetProviderCredentialsService, GetProviderCredentialsServiceResponse } from '@domains/providers';
import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';

import { Roles, withAuthorization } from '../../middlewares';

const maskCredValues = (response: GetProviderCredentialsServiceResponse): GetProviderCredentialsServiceResponse => {
  for (const { credentialsDetails } of response.credentialsData) {
    for (const cred of credentialsDetails) {
      cred.value = '*'.repeat(cred.value.length);
    }
  }

  return response;
};

const controller: THttpMethod<
  void,
  Paths.GetProviderCredentials.PathParameters,
  GetProviderCredentialsServiceResponse
> = async (req, res) => {
  const service = req.container.resolve<GetProviderCredentialsService>(GetProviderCredentialsService.name);
  const response = await service.execute({ providerCode: req.params.code });

  if (req.user?.roles.includes(Roles.ADMIN)) {
    return res.send(response).status(200).end();
  }

  return res.send(maskCredValues(response)).status(200).end();
};

export const getProviderCredentials = withAuthorization([Roles.ADMIN, Roles.VIEWER], controller);
