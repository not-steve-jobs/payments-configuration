import request from 'supertest';

import { DataSetBuilder, generateUpsertConfigServicePayload } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { ProviderEntity } from '@core/contracts/infrastructure/entities';
import { ProviderType } from '@core';

async function seed(): Promise<ProviderEntity> {
  const { provider } = await DataSetBuilder.create()
    .withProviderMethods({ isEnabled: true, isPayoutAsRefund: true })
    .withProvider({ code: 'stripe', name: 'stripe' })
    .withCountry({ iso2: 'CY' })
    .withAuthority({ fullCode: 'GM' })
    .withMethod({ code: 'cards', name: 'cards' })
    .withCountriesAuthorities({ authorityFullCode: 'GM', countryIso2: 'CY' })
    .withCredential({ authorityFullCode: 'GM', countryIso2: 'CY' })
    .build();
  await DataSetBuilder.create()
    .withProviderMethods({ providerId: provider.id })
    .withCredential({ providerCode: provider.code, countryIso2: 'IL', authorityFullCode: 'GM' })
    .withCountry({ iso2: 'IL' })
    .withAuthority({ fullCode: 'GM' })
    .withMethod({ code: 'cards', name: 'cards' })
    .withCountriesAuthorities({ countryIso2: 'IL', authorityFullCode: 'GM' })
    .build();
  // Shared credentials
  await DataSetBuilder.create().withCredential({ providerCode: provider.code, countryIso2: null, currencyIso3: null, authorityFullCode: null }).build();

  return provider;
}

describe('DeleteCredentialsIfUnmapCA', () => {
  const sendUpsertConfigRequest = (payload: object): request.Test =>
    request(baseUrl)
      .put(`api/config`)
      .withAuth()
      .send(payload);

  const sendGetCredentialsRequest = (providerCode: string): request.Test =>
    request(baseUrl)
      .get(`api/providers/${providerCode}/credentials`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should delete specific credentials if country authority was deleted', async () => {
    const provider = await seed();

    { // Should have two credentials after seed for skrill provider
      const { body: credentials } = await sendGetCredentialsRequest(provider.code);

      expect(credentials.credentialsData).toHaveLength(3);
    }

    { // Upon update we deleted one bounded country authority and should be returned only one CA
      const payload = generateUpsertConfigServicePayload({
        provider: { name: provider.name, code: provider.code },
        countryAuthorityMethods: [
          { country: 'CY', authority: 'GM', method: 'cards' },
        ],
      });

      const { body } = await sendUpsertConfigRequest(payload);

      expect(body).toStrictEqual({
        provider: {
          name: provider.name,
          code: provider.code,
          isEnabled: true,
          type: ProviderType.DEFAULT,
        },
        countryAuthorityMethods: [
          {
            country: 'CY',
            authority: 'GM',
            methodCode: 'cards',
            methodName: 'cards',
            isEnabled: false,
          },
        ],
      });
    }

    { // Should have only ONE credentials after patch operation
      const { body: credentials } = await sendGetCredentialsRequest(provider.code);

      expect(credentials.credentialsData).toHaveLength(2);
      // Shared credentials shouldn't have parameters
      expect(Object.keys(credentials.credentialsData[0].parameters)).toHaveLength(0);
      expect(credentials.credentialsData[1].parameters).toStrictEqual({
        countryAuthorities: [
          {
            authority: 'GM',
            country: 'CY',
          },
        ],
        currencies: [],
      });
    }
  });
});
