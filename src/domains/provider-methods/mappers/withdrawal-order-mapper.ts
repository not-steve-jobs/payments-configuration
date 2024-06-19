import { WithdrawalOrderDto } from '@domains/provider-methods';
import { UpdateWithdrawalsOrderBody } from '@domains/provider-methods/use-cases/update-withdrawals-order/types';
import { buildKey } from '@utils';

export class WithdrawalOrderMapper {
  public static mapWithdrawalsOrderToProviderMethod({ refunds, payouts }: UpdateWithdrawalsOrderBody): WithdrawalOrderDto[] {
    const length = refunds.length;
    const map = new Map<string, WithdrawalOrderDto>();

    refunds.forEach((r, idx) => {
      map.set(buildKey(r.providerCode, r.methodCode), {
        providerCode: r.providerCode,
        methodCode: r.methodCode,
        refundsOrder: length - idx,
        payoutsOrder: 1,
      });
    });
    payouts.forEach((p, idx) => {
      const withdrawal = map.get(buildKey(p.providerCode, p.methodCode));
      if (withdrawal) {
        withdrawal.payoutsOrder = length - idx;
      }
    });

    return [...map.values()];
  }
}
