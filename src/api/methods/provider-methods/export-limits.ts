import { ExportLimits } from '@domains/provider-methods';
import { THttpMethod } from '@internal/core-library';

import { Roles, withAuthorization } from '../../middlewares';

const controller: THttpMethod<
  void,
  void,
  string
> = async (req, res) => {
  const service = req.container.resolve<ExportLimits>(ExportLimits.name);
  const response = await service.execute();

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${response.fileName}"`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  return res.send(response.data).status(200).end();
};

export const exportLimits = withAuthorization([Roles.ADMIN, Roles.VIEWER, Roles.CLIENT_ACCOUNTING], controller);
