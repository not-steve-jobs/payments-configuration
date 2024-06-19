import { THttpMethod } from '@internal/core-library';
import { CreateCountryAuthority } from '@domains/countries-authorities';
import { Paths } from '@typings/openapi';
import { CountryAuthorityDto } from '@core';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.CreateCountryAuthority.RequestBody,
  void,
  CountryAuthorityDto
> = async (req, res) => {
  const payload: CountryAuthorityDto = { authority: req.body.authority, country: req.body.country };

  const service = req.container.resolve<CreateCountryAuthority>(CreateCountryAuthority.name);
  const response = await service.execute(payload);

  return res.send(response).status(200).end();
};

export const createCountryAuthority = withAuthorization([Roles.ADMIN], controller);
