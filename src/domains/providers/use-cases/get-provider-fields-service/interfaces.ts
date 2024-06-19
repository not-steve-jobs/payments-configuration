import { GetProviderFieldsServiceParams, ProviderFields } from '@domains/providers';

export interface GetProviderFieldsService {
  execute(payload: GetProviderFieldsServiceParams): Promise<ProviderFields>;
}
