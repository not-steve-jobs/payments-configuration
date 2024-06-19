import request from 'supertest';

import { CountryAuthorityEntity, ProviderEntity } from '@core/contracts/infrastructure/entities';
import { DataSetBuilder, generateUpsertConfigServicePayload } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { ApplicationPlatforms } from '@core/contracts/application';

async function seed(): Promise<{
  provider: ProviderEntity;
  countryAuthority: CountryAuthorityEntity;
}> {
  const { provider, countryAuthority } = await DataSetBuilder.create()
    .withProviderMethods({ isEnabled: true, isPayoutAsRefund: true })
    .withProvider({ code: 'stripe', name: 'stripe' })
    .withCountry({ iso2: 'CY' })
    .withAuthority({ fullCode: 'GM' })
    .withMethod({ code: 'cards', name: 'cards' })
    .withCountriesAuthorities({ authorityFullCode: 'GM', countryIso2: 'CY' })
    .withCredential({ authorityFullCode: 'GM', countryIso2: 'CY' })
    .withProviderRestriction({ platform: ApplicationPlatforms.ANDROID })
    .build();
  await DataSetBuilder.create()
    .withProviderMethods({ providerId: provider.id })
    .withCredential({ providerCode: provider.code, countryIso2: 'IL', authorityFullCode: 'GM' })
    .withCountry({ iso2: 'IL' })
    .withAuthority({ fullCode: 'GM' })
    .withMethod({ code: 'cards', name: 'cards' })
    .withCountriesAuthorities({ countryIso2: 'IL', authorityFullCode: 'GM' })
    .withProviderRestriction({ platform: ApplicationPlatforms.IOS, providerCode: provider.code })
    .build();

  return { provider, countryAuthority };
}

describe('DeleteRestrictionsIfUnmapCA', () => {
  const sendUpsertConfigRequest = (payload: object): request.Test =>
    request(baseUrl)
      .put(`api/config`)
      .withAuth()
      .send(payload);

  const sendGetRestrictions = (providerCode: string): request.Test =>
    request(baseUrl)
      .get(`api/providers/${providerCode}/restrictions`)
      .withAuth();

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should delete restrictions if country authority was deleted', async () => {
    const { provider, countryAuthority } = await seed();

    { // Should have two restrictions after seed for skrill provider
      const { body: restrictions } = await sendGetRestrictions(provider.code);

      expect(restrictions).toHaveLength(2);
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
          type: provider.type,
          isEnabled: true,
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

    { // Should have only ONE restrictions after patch operation
      const { body: restrictions } = await sendGetRestrictions(provider.code);

      expect(restrictions).toHaveLength(1);
      expect(restrictions[0]).toStrictEqual({
        platform: ApplicationPlatforms.ANDROID,
        isEnabled: true,
        countriesAuthorities: [
          { authority: countryAuthority.authorityFullCode, country: countryAuthority.countryIso2 },
        ],
        settings: [],
      });
    }
  });
});
