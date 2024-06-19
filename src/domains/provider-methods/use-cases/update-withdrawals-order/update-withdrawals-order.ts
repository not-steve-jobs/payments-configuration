import { UseCase } from '@core';
import { CountryAuthorityRepository, ProviderMethodRepository } from '@infra';
import {
  UpdateWithdrawalsOrderBody,
  UpdateWithdrawalsOrderParams,
  UpdateWithdrawalsOrderResponse,
} from '@domains/provider-methods/use-cases/update-withdrawals-order/types';
import {  WithdrawalOrderMapper } from '@domains/provider-methods/mappers';

import { WithdrawalsOrderValidator } from './validators';

export interface UpdateWithdrawalsOrderOptions {
  providerMethodRepository: ProviderMethodRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
}

export interface WithdrawalOrderDto {
  providerCode: string;
  methodCode: string;
  refundsOrder: number;
  payoutsOrder: number;
}

export class UpdateWithdrawalsOrder extends UseCase<
  UpdateWithdrawalsOrderParams,
  UpdateWithdrawalsOrderBody
> {
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly countryAuthorityRepository: CountryAuthorityRepository;

  constructor(options: UpdateWithdrawalsOrderOptions) {
    super(options);
    this.providerMethodRepository = options.providerMethodRepository;
    this.countryAuthorityRepository = options.countryAuthorityRepository;
  }

  public async execute({ authority, country, withdrawals }: UpdateWithdrawalsOrderParams): Promise<UpdateWithdrawalsOrderResponse> {
    const { id: countryAuthorityId } = await this.countryAuthorityRepository.findOneOrThrow(authority, country);

    const withdrawalsDB = await this.providerMethodRepository.findByCA(countryAuthorityId);

    WithdrawalsOrderValidator.validate({ withdrawalsDB, withdrawals });

    const pmWithdrawals = WithdrawalOrderMapper.mapWithdrawalsOrderToProviderMethod(withdrawals);
    await this.providerMethodRepository.updateWithdrawalsOrder(pmWithdrawals, countryAuthorityId);

    const [refunds, payouts] = await Promise.all([
      this.providerMethodRepository.findByCA(countryAuthorityId, 'refundsOrder'),
      this.providerMethodRepository.findByCA(countryAuthorityId, 'payoutsOrder'),
    ]);

    return { payouts, refunds };
  }
}
