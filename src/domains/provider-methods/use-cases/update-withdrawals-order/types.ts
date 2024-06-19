import { ProviderMethodCodesDto, ProviderMethodDto, WithdrawalsOrderRequestParams } from '@domains/provider-methods';

export interface UpdateWithdrawalsOrderBody {
  payouts: ProviderMethodCodesDto[];
  refunds: ProviderMethodCodesDto[];
}

export interface UpdateWithdrawalsOrderParams extends WithdrawalsOrderRequestParams {
  withdrawals: UpdateWithdrawalsOrderBody;
}

export interface UpdateWithdrawalsOrderResponse {
  payouts: ProviderMethodDto[];
  refunds: ProviderMethodDto[];
}
