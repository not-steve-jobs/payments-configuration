import { DepositConfig, GetDepositConfigsParams } from '@domains/interop/types';

export interface GetDepositConfigs {
  execute(payload: GetDepositConfigsParams): Promise<DepositConfig[]>;
}
