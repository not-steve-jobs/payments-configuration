import { THttpMethod } from '@internal/core-library';
import {
  ProviderFields,
  UpsertProviderFieldsServiceParams,
  UpsertProviderFieldsServiceQueryParams,
} from '@domains/providers';
import { UpsertProviderFieldsService } from '@domains/providers/use-cases/upsert-provider-fields-service';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  ProviderFields,
  UpsertProviderFieldsServiceQueryParams,
  ProviderFields
> = async (req, res) => {
  const params: UpsertProviderFieldsServiceParams = {
    ...req.body,
    providerCode: req.params.code,
  };

  const service = req.container.resolve<UpsertProviderFieldsService>('UpsertProviderFieldsService');
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};

export const upsertProviderFields = withAuthorization([Roles.ADMIN], controller);
