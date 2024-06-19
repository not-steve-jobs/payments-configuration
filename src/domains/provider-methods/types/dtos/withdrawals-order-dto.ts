import { ProviderMethodDto } from '@domains/provider-methods';

export interface WithdrawalsOrderDto {
  payouts: ProviderMethodDto[];
  refunds: ProviderMethodDto[];
}
