import request from 'supertest';

import { DataSetBuilder, generateUpsertConfigServicePayload } from '@test-component/data';
import { cleanUp } from '@test-component/utils';
import { ProviderEntity } from '@core/contracts/infrastructure/entities';
import { ProviderType } from '@core';

async function seed(): Promise<ProviderEntity> {
  const { provider } = await DataSetBuilder.create()
    .withProviderMethods({ isEnabled: true, isPayoutAsRefund: true })
    .withProvider({ code: 'stripe', name: 'stripe', convertedCurrency: null })
    .withCountry({ iso2: 'CY' })
    .withAuthority({ fullCode: 'GM' })
    .withMethod({ code: 'cards', name: 'cards' })
    .withCountriesAuthorities({ authorityFullCode: 'GM', countryIso2: 'CY' })
    .withCredential({ authorityFullCode: 'GM', countryIso2: 'CY' })
    .withProviderRestriction()
    .build();
  await DataSetBuilder.create()
    .withProviderMethods({ providerId: provider.id })
    .withCredential({ providerCode: provider.code, countryIso2: 'IL', authorityFullCode: 'GM' })
    .withCountry({ iso2: 'IL' })
    .withAuthority({ fullCode: 'GM' })
    .withMethod({ code: 'cards', name: 'cards' })
    .withCountriesAuthorities({ countryIso2: 'IL', authorityFullCode: 'GM' })
    .withProviderRestriction()
    .build();
  await DataSetBuilder.create()
    .withProviderMethods({ providerId: provider.id })
    .withCredential({ providerCode: provider.code, countryIso2: 'VN', authorityFullCode: 'GM' })
    .withCountry({ iso2: 'VN' })
    .withAuthority({ fullCode: 'GM' })
    .withMethod({ code: 'cards', name: 'cards' })
    .withCountriesAuthorities({ countryIso2: 'VN', authorityFullCode: 'GM' })
    .withProviderRestriction()
    .build();

  return provider;
}

describe('MapProviderToNewMethods', () => {
  const sendUpsertConfigRequest = (payload: object): request.Test =>
    request(baseUrl)
      .put(`api/config`)
      .withAuth()
      .send(payload);

  beforeEach(async () => {
    await cleanUp();
  });

  it('Should map new methods while ensuring previous methods are unmapped', async () => {
    const provider = await seed();
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
        type: ProviderType.DEFAULT,
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
  });
});
