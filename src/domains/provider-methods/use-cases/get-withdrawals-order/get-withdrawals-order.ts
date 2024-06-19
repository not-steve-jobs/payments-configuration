import { UseCase } from '@core';
import { CountryAuthorityRepository, ProviderMethodRepository, WithdrawalOrderType } from '@infra';
import { WithdrawalsOrderRequestParams } from '@domains/provider-methods/types/contracts/withdrawals-order';
import { ProviderMethodDto, WithdrawalsOrderDto } from '@domains/provider-methods/types';

export interface GetWithdrawalsOrderOptions {
  providerMethodRepository: ProviderMethodRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
}

export class GetWithdrawalsOrder extends UseCase<
  WithdrawalsOrderRequestParams,
  WithdrawalsOrderDto
> {
  private readonly providerMethodRepository: ProviderMethodRepository;
  private readonly countryAuthorityRepository: CountryAuthorityRepository;

  constructor(options: GetWithdrawalsOrderOptions) {
    super(options);
    this.providerMethodRepository = options.providerMethodRepository;
    this.countryAuthorityRepository = options.countryAuthorityRepository;
  }

  public async execute(payload: WithdrawalsOrderRequestParams): Promise<WithdrawalsOrderDto> {
    const { id: countryAuthorityId } = await this.countryAuthorityRepository.findOneOrThrow(payload.authority, payload.country);

    const [refunds, payouts] = await Promise.all([
      this.getSortedWithdrawals(countryAuthorityId, 'refundsOrder'),
      this.getSortedWithdrawals(countryAuthorityId, 'payoutsOrder'),
    ]);

    return { refunds, payouts };
  }

  private getSortedWithdrawals(countryAuthorityId: string, orderType: WithdrawalOrderType): Promise<ProviderMethodDto[]> {
    return this.providerMethodRepository.findByCA(countryAuthorityId, orderType);
  }
}
