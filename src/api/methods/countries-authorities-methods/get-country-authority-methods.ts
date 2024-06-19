import { THttpMethod } from '@internal/core-library';
import {
  GetCountryAuthorityMethodsService,
  GetCountryAuthorityMethodsServiceParams,
  GetCountryAuthorityMethodsServiceResponse,
} from '@domains/countries-authorities-methods';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  GetCountryAuthorityMethodsServiceParams,
  GetCountryAuthorityMethodsServiceResponse
> = async (req, res) => {
  const params: GetCountryAuthorityMethodsServiceParams = {
    country: req.query.country,
    authority: req.query.authority,
  };

  const service = req.container.resolve<GetCountryAuthorityMethodsService>(GetCountryAuthorityMethodsService.name);
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};

export const getCountryAuthorityMethods = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
