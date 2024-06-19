import { DepositSetting, PayoutSetting, RefundSetting } from '@domains/providers/types/contracts';

export interface CountryAuthorityMethodDto {
  country: string;
  authority: string;
  method: string;
}

export interface CurrencyConfigUpdateDto {
  currency: string;
  deposit?: Partial<DepositSetting>;
  payout?: Partial<PayoutSetting>;
  refund?: Partial<RefundSetting>;
}

export interface BulkUpdateTransactionConfigsParams {
  providerCode: string;
  countryAuthorityMethods: CountryAuthorityMethodDto[];
  currencyConfigs: CurrencyConfigUpdateDto[];
}
