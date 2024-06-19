import { THttpMethod } from '@internal/core-library';
import { Paths } from '@typings/openapi';
import { ProviderFields } from '@domains/providers';
import { GetProviderFieldsService } from '@domains/providers/use-cases/get-provider-fields-service';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  Paths.GetProviderFields.PathParameters,
  ProviderFields
> = async (req, res) => {
  const service = req.container.resolve<GetProviderFieldsService>('GetProviderFieldsService');

  const response = await service.execute({ providerCode: req.params.code });

  return res.send(response).status(200).end();
};

export const getProviderFields = withAuthorization([Roles.ADMIN, Roles.VIEWER], controller);
