import { Paths } from '@typings/openapi';
import { THttpMethod } from '@internal/core-library';
import {
  AddCountryParams,
  AddCountryService,
} from '@domains/countries-authorities-methods/use-cases/add-country-service';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<Paths.AddCountry.RequestBody, void, Paths.AddCountry.Responses.$200> = async (
  req,
  res
) => {
  const service = req.container.resolve<AddCountryService>(AddCountryService.name);
  const params: AddCountryParams = {
    iso2: req.body.iso2,
    iso3: req.body.iso3,
    name: req.body.name.trim(),
    group: req.body?.group?.trim() || '',
  };

  const country = await service.execute(params);

  return res.send(country).status(200).end();
};

export const addCountry = withAuthorization([Roles.ADMIN], controller);
