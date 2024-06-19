import { THttpMethod } from '@internal/core-library';
import {
  UpdateCountryAuthorityMethodStatusQueryParams,
  UpdateCountryAuthorityMethodStatusReqBody,
  UpdateCountryAuthorityMethodStatusResponse, UpdateCountryAuthorityMethodStatusService,
  UpdateCountryAuthorityMethodStatusServiceParams,
} from '@domains/countries-authorities-methods';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  UpdateCountryAuthorityMethodStatusReqBody,
  UpdateCountryAuthorityMethodStatusQueryParams,
  UpdateCountryAuthorityMethodStatusResponse
> = async (req, res) => {
  const params: UpdateCountryAuthorityMethodStatusServiceParams = {
    country: req.query.country,
    authority: req.query.authority,
    methodCode: req.params.methodCode,
    isEnabled: req.body.isEnabled,
  };

  const service = req.container.resolve<UpdateCountryAuthorityMethodStatusService>(UpdateCountryAuthorityMethodStatusService.name);
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};

export const updateCountryAuthorityMethodStatus = withAuthorization([Roles.ADMIN], controller);
