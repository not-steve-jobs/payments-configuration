export interface DepositSetting {
  minAmount: number | null;
  maxAmount: number | null;
  isEnabled: boolean;
}

export interface PayoutSetting {
  minAmount: number | null;
  maxAmount: number | null;
  isEnabled: boolean;
}

export interface RefundSetting {
  minAmount: number | null;
  period: number | null;
  isEnabled: boolean;
}

export interface  CurrencySetting {
  currency: string;
  deposit: DepositSetting;
  payout?: PayoutSetting;
  refund?: RefundSetting;
}
