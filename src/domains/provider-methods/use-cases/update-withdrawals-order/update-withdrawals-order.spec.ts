import casual from 'casual';

import { NotFoundError } from '@internal/errors-library';
import {
  GetWithdrawalsOrderOptions,
  ProviderMethodCodesDto,
  ProviderMethodDto,
  UpdateWithdrawalsOrder,
  UpdateWithdrawalsOrderOptions,
} from '@domains/provider-methods';
import { WithdrawalOrderType } from '@infra';
import { UpdateWithdrawalsOrderParams } from '@domains/provider-methods/use-cases/update-withdrawals-order/types';


const generateProviderMethodCodesDto = (options: Partial<ProviderMethodCodesDto> = {}): ProviderMethodDto =>  ({
  providerCode: casual.word,
  methodCode: casual.word,
  providerName: casual.word,
  methodName: casual.word,
  ...options,
});

describe('UpdateWithdrawalsOrder', () => {
  it('Should throw not found error for non existing country-authority', async () => {
    const params: UpdateWithdrawalsOrderParams = {
      authority: 'unknown',
      country: 'unknown',
      withdrawals: { refunds: [], payouts: [] },
    };
    const options = mock<UpdateWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockRejectedValue(new NotFoundError('Unknown Country-Authority', {
          id: `${params.authority}:${params.authority}`,
        })),
      },
      providerMethodRepository: { findByCA: jest.fn().mockResolvedValue([]) },
    });
    const useCase = new UpdateWithdrawalsOrder(options);

    await expect(useCase.execute(params)).rejects.toThrow('Unknown Country-Authority');
    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
  });

  it('Should throw duplicates error', async () => {
    const pm1 = generateProviderMethodCodesDto();
    const params: UpdateWithdrawalsOrderParams = {
      authority: 'authority',
      country: 'country',
      withdrawals: { refunds: [pm1, generateProviderMethodCodesDto(pm1)], payouts: [] },
    };
    const options = mock<GetWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue({ id: 'caId' }),
      },
      providerMethodRepository: { findByCA: jest.fn().mockResolvedValue([]) },
    });
    const useCase = new UpdateWithdrawalsOrder(options);

    await expect(useCase.execute(params)).rejects.toThrow('Withdrawals contain duplicates');
    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId');
  });

  it('Should throw withdrawals sets miss match with existing one', async () => {
    const params: UpdateWithdrawalsOrderParams = {
      authority: 'authority',
      country: 'country',
      withdrawals: { refunds: [generateProviderMethodCodesDto()], payouts: [generateProviderMethodCodesDto()] },
    };
    const options = mock<GetWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue({ id: 'caId' }),
      },
      providerMethodRepository: { findByCA: jest.fn().mockResolvedValue([generateProviderMethodCodesDto(), generateProviderMethodCodesDto()]) },
    });
    const useCase = new UpdateWithdrawalsOrder(options);

    await expect(useCase.execute(params)).rejects.toThrow('Withdrawal set does not match to existing one');
    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId');
  });

  it('Should throw withdrawal missed error', async () => {
    const params: UpdateWithdrawalsOrderParams = {
      authority: 'authority',
      country: 'country',
      withdrawals: { refunds: [generateProviderMethodCodesDto()], payouts: [generateProviderMethodCodesDto()] },
    };
    const options = mock<GetWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue({ id: 'caId' }),
      },
      providerMethodRepository: { findByCA: jest.fn().mockResolvedValue([generateProviderMethodCodesDto()]) },
    });
    const useCase = new UpdateWithdrawalsOrder(options);

    await expect(useCase.execute(params)).rejects.toThrow('Withdrawal is missed');
    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId');
  });


  it('Should update and return ordered provider methods for refunds and withdrawals', async () => {
    const pm2 = generateProviderMethodCodesDto();
    const pm1 = generateProviderMethodCodesDto();
    const params: UpdateWithdrawalsOrderParams = {
      authority: 'authority',
      country: 'country',
      withdrawals: {
        refunds: [pm1, pm2],
        payouts: [pm2, pm1],
      },
    };
    const payouts: ProviderMethodCodesDto[] = [pm1, pm2];
    const refunds: ProviderMethodCodesDto[] = [pm2, pm1];
    const options = mock<GetWithdrawalsOrderOptions>({
      countryAuthorityRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue({ id: 'caId' }),
      },
      providerMethodRepository: {
        findByCA: jest.fn().mockImplementation(
          (countryAuthorityId: string, orderType: WithdrawalOrderType) => (orderType === 'payoutsOrder' ? payouts : refunds)
        ),
        updateWithdrawalsOrder: jest.fn().mockResolvedValue({ refunds, payouts }),
      },
    });
    const useCase = new UpdateWithdrawalsOrder(options);

    const result = await useCase.execute(params);

    expect(options.countryAuthorityRepository.findOneOrThrow).toBeCalledOnceWith(params.authority, params.country);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledTimes(3);
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId');
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId', 'refundsOrder');
    expect(options.providerMethodRepository.findByCA).toHaveBeenCalledWith('caId', 'payoutsOrder');
    expect(options.providerMethodRepository.updateWithdrawalsOrder).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({ payouts, refunds });
  });
});
