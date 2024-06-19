import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import {
  UpdateCountryAuthorityMethodsOrderResponse,
  UpdateCountryAuthorityMethodsOrderService,
  UpdateCountryAuthorityMethodsOrderServiceParams,
} from '@domains/countries-authorities-methods';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateCountryAuthorityMethodsOrder.RequestBody,
  Paths.UpdateCountryAuthorityMethodsOrder.QueryParameters,
  UpdateCountryAuthorityMethodsOrderResponse
> = async (req, res) => {
  const params: UpdateCountryAuthorityMethodsOrderServiceParams = {
    country: req.query.country,
    authority: req.query.authority,
    methodCodes: req.body.methodCodes,
  };

  const service = req.container.resolve<UpdateCountryAuthorityMethodsOrderService>(UpdateCountryAuthorityMethodsOrderService.name);
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};

export const updateCountryAuthorityMethodsOrder = withAuthorization([Roles.ADMIN], controller);
