import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import {
  ProviderSettingsResponse,
  UpdateProviderSettingsService,
  UpdateProviderSettingsServiceParams,
} from '@domains/providers';
import { ProviderType } from '@core';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.UpdateProviderSettings.RequestBody,
  Paths.UpdateProviderSettings.PathParameters,
  ProviderSettingsResponse
> = async (req, res) => {
  const service = req.container.resolve<UpdateProviderSettingsService>(UpdateProviderSettingsService.name);
  const params: UpdateProviderSettingsServiceParams = {
    provider: {
      code: req.params.code,
      type: req.body.provider.type as ProviderType,
      convertedCurrency: req.body.provider.convertedCurrency
        ? req.body.provider.convertedCurrency.toUpperCase()
        : null,
    },
    countryAuthoritySettings: req.body.countryAuthoritySettings,
  };

  const response = await service.execute(params);

  return res.send(response).status(200).end();
};

export const updateProviderSettings = withAuthorization([Roles.ADMIN], controller);
