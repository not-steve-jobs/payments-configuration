import { GetProviderBoundedMethodsService, ProviderMethodBoundedDto } from '@domains/providers';
import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.GetProviderBoundedMethods.RequestBody,
  Paths.GetProviderBoundedMethods.PathParameters,
  ProviderMethodBoundedDto[]
> = async (req, res) => {
  const service = req.container.resolve<GetProviderBoundedMethodsService>(GetProviderBoundedMethodsService.name);
  const response = await service.execute({
    providerCode: req.params.code,
    countryAuthorities: req.body.countriesAuthorities,
  });

  return res.send(response).status(200).end();
};

export const getProviderBoundedMethods = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
