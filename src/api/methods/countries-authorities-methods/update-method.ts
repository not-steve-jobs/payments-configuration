import { THttpMethod } from '@internal/core-library';
import { Roles, withAuthorization } from '@api/middlewares';
import { UpdateMethod } from '@domains/countries-authorities-methods';
import { Components } from '@typings/openapi';
import MethodDto = Components.Schemas.MethodDto;

const controller: THttpMethod<
  MethodDto,
  void,
  MethodDto
> = async (req, res) => {
  const useCase = req.container.resolve<UpdateMethod>(UpdateMethod.name);
  const response = await useCase.execute(req.body);

  return res.send(response).status(200).end();
};

export const updateMethod = withAuthorization([Roles.ADMIN], controller);
