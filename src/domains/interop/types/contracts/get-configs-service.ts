import { FieldDto } from '@core/contracts';

export interface DepositSetting {
  min?: number | null;
  max?: number | null;
  enabled?: boolean;
  fields?: FieldDto[];
}

export interface PayoutSetting {
  min?: number | null;
  max?: number | null;
  enabled?: boolean;
  order?: number;
  paymentAccountRequired?: boolean;
  fields?: FieldDto[];
}

export interface RefundSetting {
  enabled?: boolean;
  order?: number;
  paymentAccountRequired?: boolean;
  minRefundableAmountThreshold: number;
  maxRefundablePeriodInDays: number | null;
  isRequestDetailsRequired?: boolean;
}

export interface KeyValueConfig {
  key: string;
  value: string;
}

interface ProviderLegacyConfig {
  stpAllowed: boolean;
  stpMinDepositsCount: number;
  stpMaxDepositAmount: number;
  defaultLeverage: number;
  transactionRejectApplicable: boolean;
  settings: unknown[];
  fields: unknown[];
  withdrawalFields: unknown[];
  stpSettings: Record<string, unknown>;
}

export interface BankAccountDto {
  name: string;
  type: string;
  config: KeyValueConfig[];
}

export interface ProviderConfig extends ProviderLegacyConfig {
  key: string;
  name: string;
  maintenance: boolean;
  depositSettings?: DepositSetting;
  payoutSettings?: PayoutSetting;
  refundSettings?: RefundSetting;
  config: KeyValueConfig[];
  accounts: BankAccountDto[];
}

export interface ConfigDto {
  currency: string;
  providers: ProviderConfig[];
}

export interface GetConfigsServiceParams {
  country: string;
  authority: string;
}
