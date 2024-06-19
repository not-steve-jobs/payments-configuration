import { BulkUpdateTransactionConfigs } from '@domains/providers/use-cases';
import { Paths } from '@typings/openapi';
import { THttpMethod } from '@internal/core-library';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  Paths.BulkUpdateTransactionConfigs.RequestBody,
  void,
  boolean
> = async (req, res) => {
  const service = req.container.resolve<BulkUpdateTransactionConfigs>(BulkUpdateTransactionConfigs.name);
  await service.execute({
    providerCode: req.params.code,
    countryAuthorityMethods: req.body.countryAuthorityMethods,
    currencyConfigs: req.body.currencyConfigs,
  });

  return res.status(204).end();
};

export const bulkUpdateTransactionConfigs = withAuthorization([Roles.ADMIN], controller);
