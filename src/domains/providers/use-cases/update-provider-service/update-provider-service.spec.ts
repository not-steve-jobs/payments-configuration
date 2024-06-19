import casual from 'casual';

import { ProviderEntity } from '@core/contracts/infrastructure/entities';
import { UpdateProviderServiceParams } from '@domains/providers/types/contracts';

import { UpdateProviderService, UpdateProviderServiceOptions } from './update-provider-service';

describe('UpdateProviderService', () => {
  it('Should return provider dto', async () => {
    const provider = mock<ProviderEntity>({ id: casual.uuid, name: casual.string, code: casual.string, isEnabled: true });
    const options = mock<UpdateProviderServiceOptions>({
      providerRepository: {
        findOneOrThrow: jest.fn().mockResolvedValue(provider),
        update: jest.fn().mockResolvedValue({
          ...provider,
          isEnabled: false,
        }),
      },
    });
    const payload: UpdateProviderServiceParams = { providerCode: provider.code, data: { isEnabled: false } };

    const service = new UpdateProviderService(options);

    expect(await service.execute(payload)).toStrictEqual({
      name: provider.name,
      code: provider.code,
      isEnabled: payload.data.isEnabled,
      type: provider.type,
    });
  });
});
