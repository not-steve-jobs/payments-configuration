import { Authority } from '@core';
import { GetConfigsServiceParams } from '@domains/interop';

import { GetConfigsServiceV1, GetConfigsServiceV1Options } from './get-configs-service-v1';

describe('GetConfigsServiceV1', () => {
  it('Should return empty array if there are no records', async () => {
    const options = mock<GetConfigsServiceV1Options>({
      transactionConfigRepository: { getProviderTransactionConfigs: jest.fn().mockResolvedValue([]) },
      fieldRepository: { findFieldsWithOptions: jest.fn().mockResolvedValue([]) },
      credentialsRepository: { findAllByAuthorityAndCountry: jest.fn().mockResolvedValue([]) },
      bankAccountsRepository: { findAllByAuthorityAndCountry: jest.fn().mockResolvedValue([]) },
    });
    const payload: GetConfigsServiceParams = { authority: Authority.CYSEC, country: 'AR' };

    const service = new GetConfigsServiceV1(options);
    const response = await service.execute(payload);

    expect(response).toHaveLength(0);
  });
});
