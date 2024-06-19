import { THttpMethod } from '@internal/core-library';
import { GetInteropStpRulesParams, StpProviderRuleInterop } from '@domains/interop';
import { GetInteropStpProviderRules } from '@domains/interop/use-cases';

export const getInteropStpProviderRules: THttpMethod<
  void,
  { provider: string; authority: string },
  StpProviderRuleInterop[]
> = async (req, res) => {
  const params: GetInteropStpRulesParams = {
    providerCode: req.query.provider,
    authority: req.query.authority,
  };

  const useCase = req.container.resolve<GetInteropStpProviderRules>(GetInteropStpProviderRules.name);
  const response = await useCase.execute(params);

  return res.send(response).status(200).end();
};

