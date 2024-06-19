import casual from 'casual';

import { NotFoundError } from '@internal/errors-library';
import {
  GetWithdrawalsOrder,
  GetWithdrawalsOrderOptions,
  WithdrawalsOrderRequestParams,
} from '@domains/provider-methods';
import { WithdrawalOrderType } from '@infra';
import { ProviderMethodDto } from '@domains/provider-methods/types';

const generateProviderMethodDto = (options: Partial<ProviderMethodDto> = {}): ProviderMethodDto =>  ({
  providerCode: casual.word,
  providerName: casual.word,
  methodCode: casual.word,
  methodName: casual.word,
  ...options,
});

describe('GetWithdrawalsOrder', () => {
  it('Should throw not found error for non existing country-authority', async () => {
    const params: WithdrawalsOrderRequestParams = { authority: 'unknown', country: 'unknown' };
    const options = mock<GetWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockRejectedValue(new NotFoundError('Unknown Country-Authority', {
          id: `${params.country}:${params.authority}`,
        })),
      },
      providerMethodRepository: { findByCA: jest.fn().mockResolvedValue([]) },
    });
    const useCase = new GetWithdrawalsOrder(options);

    await expect(useCase.execute(params)).rejects.toThrow('Unknown Country-Authority');
    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
  });

  it('Should return empty refund and payouts orders', async () => {
    const params: WithdrawalsOrderRequestParams = { authority: 'authority', country: 'country' };
    const options = mock<GetWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue({ id: 'caId' }),
      },
      providerMethodRepository: { findByCA: jest.fn().mockResolvedValue([]) },
    });
    const useCase = new GetWithdrawalsOrder(options);

    const result = await useCase.execute(params);

    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledTimes(2);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId', 'refundsOrder');
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId', 'payoutsOrder');
    expect(result).toStrictEqual({ payouts: [], refunds: [] });
  });


  it('Should return ordered provider methods for refunds and withdrawals', async () => {
    const params: WithdrawalsOrderRequestParams = { authority: 'authority', country: 'country' };
    const payouts: ProviderMethodDto[] = [generateProviderMethodDto(), generateProviderMethodDto(), generateProviderMethodDto()];
    const refunds: ProviderMethodDto[] = [generateProviderMethodDto()];
    const options = mock<GetWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue({ id: 'caId' }),
      },
      providerMethodRepository: {
        findByCA: jest.fn().mockImplementation(
          (countryAuthorityId: string, orderType: WithdrawalOrderType) => (orderType === 'payoutsOrder' ? payouts : refunds)
        ),
      },
    });
    const useCase = new GetWithdrawalsOrder(options);

    const result = await useCase.execute(params);

    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledTimes(2);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId', 'refundsOrder');
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId', 'payoutsOrder');
    expect(result).toStrictEqual({ payouts, refunds });
  });
});
