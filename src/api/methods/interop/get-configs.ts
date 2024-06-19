import { THttpMethod } from '@internal/core-library';
import { Components } from '@typings/openapi';
import { ConfigDto, GetConfigsServiceParams } from '@domains/interop/types';
import { GetConfigsService } from '@domains/interop/use-cases';

export const getConfigs: THttpMethod<
  unknown,
  { country: Components.Parameters.CountryHeader; authority: Components.Parameters.AuthorityHeader },
  ConfigDto[]
> = async (req, res) => {
  const params: GetConfigsServiceParams = {
    country: req.query.country,
    authority: req.query.authority,
  };

  const service = req.container.resolve<GetConfigsService>('GetConfigsService');
  const response = await service.execute(params);

  return res.send(response).status(200).end();
};
