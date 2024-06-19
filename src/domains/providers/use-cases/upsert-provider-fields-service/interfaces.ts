import { ProviderFields, UpsertProviderFieldsServiceParams } from '@domains/providers';

export interface UpsertProviderFieldsService {
  execute(payload: UpsertProviderFieldsServiceParams): Promise<ProviderFields>;
}
