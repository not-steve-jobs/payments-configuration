import { ProviderMethodCodesDto } from '@domains/provider-methods';
import { ConflictError, NotFoundError } from '@internal/errors-library';
import { buildKey } from '@utils';

export interface WithdrawalsDto {
  refunds: ProviderMethodCodesDto[];
  payouts: ProviderMethodCodesDto[];
}

export interface WithdrawalsOrderValidatorParams {
  withdrawalsDB: ProviderMethodCodesDto[];
  withdrawals: WithdrawalsDto;
}

export class WithdrawalsOrderValidator {
  public static validate({ withdrawalsDB, withdrawals }: WithdrawalsOrderValidatorParams): void | never {
    this.validateWithdrawalsSize(withdrawals.refunds);
    this.validateWithdrawalsSize(withdrawals.payouts);

    const existingWithdrawalsSet = this.createWithdrawalsSet(withdrawalsDB);

    this.validateExistingWithdrawals(existingWithdrawalsSet, withdrawals.refunds);
    this.validateExistingWithdrawals(existingWithdrawalsSet, withdrawals.payouts);
  }

  private static createWithdrawalsSet(withdrawals: ProviderMethodCodesDto[]): Set<string> {
    return new Set(withdrawals.map(w => buildKey(w.methodCode, w.providerCode)));
  }

  private static validateWithdrawalsSize(withdrawals: ProviderMethodCodesDto[]): void | never {
    const withdrawalsSet = this.createWithdrawalsSet(withdrawals);
    if (withdrawalsSet.size !== withdrawals.length) {
      throw new ConflictError('Withdrawals contain duplicates', { id: withdrawals } );
    }
  }

  private static validateExistingWithdrawals(existingSet: Set<string>, updateWithdrawals: ProviderMethodCodesDto[]): void | never  {
    if (existingSet.size !== updateWithdrawals.length) {
      throw new ConflictError('Withdrawal set does not match to existing one', { id: updateWithdrawals } );
    }

    updateWithdrawals.forEach(withdrawal => {
      if (!existingSet.has(buildKey(withdrawal.methodCode, withdrawal.providerCode))) {
        throw new NotFoundError('Withdrawal is missed', { id: withdrawal });
      }
    });
  }
}

