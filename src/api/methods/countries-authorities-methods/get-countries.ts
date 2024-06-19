import { THttpMethod } from '@internal/core-library';
import { GetCountriesService, GetCountriesServiceParams, GetCountriesServiceResponse } from '@domains/countries-authorities-methods';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  GetCountriesServiceParams,
  GetCountriesServiceResponse
> = async (req, res) => {
  const params: GetCountriesServiceParams = { authority: req.query.authority, providerCode: req.query.providerCode };
  const service = req.container.resolve<GetCountriesService>(GetCountriesService.name);
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};

export const getCountries = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
