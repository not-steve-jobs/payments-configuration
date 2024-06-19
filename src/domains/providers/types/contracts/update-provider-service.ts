import { ProviderDto } from '@core/contracts/dtos';

export interface UpdateProviderServiceParams {
  providerCode: string;
  data: Partial<ProviderDto>;
}
