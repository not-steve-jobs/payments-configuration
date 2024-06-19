import { THttpMethod } from '@internal/core-library';
import { DepositConfig, GetDepositConfigsServiceParams } from '@domains/interop/types/contracts';
import { GetDepositConfigs } from '@domains/interop/use-cases';

export const getDepositConfigs: THttpMethod<
  unknown,
  GetDepositConfigsServiceParams,
  DepositConfig[] | { message: string }
> = async (req, res) => {
  const params: GetDepositConfigsServiceParams = {
    country: req.query.country,
    authority: req.query.authority,
    platform: req.query.platform,
    version: req.query.version,
  };

  const service = req.container.resolve<GetDepositConfigs>('GetDepositConfigs');
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};
