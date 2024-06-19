import { ConfigDto, GetConfigsServiceParams } from '@domains/interop/types';

export interface GetConfigsService {
  execute(payload: GetConfigsServiceParams): Promise<ConfigDto[]>;
}
