import { CountryAuthorityMethodWithProvidersEntity } from '@core';

import { CountryAuthorityMethodFactory } from './country-authority-method-factory';

describe('CountryAuthorityMethodsDtoFactory', () => {
  describe('#createWithProviders', () => {
    it('Should return DTO with providers list', () => {
      const entity = mock<CountryAuthorityMethodWithProvidersEntity>({
        methodName: 'Visa/Mastercard',
        methodCode: 'cards',
        isEnabled: true,
        providers: 'Stripe,Ingenico',
      });

      const dto = CountryAuthorityMethodFactory.createDtoWithProviders(entity);

      expect(dto).toStrictEqual({
        methodName: entity.methodName,
        methodCode: entity.methodCode,
        isEnabled: entity.isEnabled,
        providers: ['Stripe', 'Ingenico'],
      });
    });

    it('Should return DTO with empty list', () => {
      const entity = mock<CountryAuthorityMethodWithProvidersEntity>({
        methodName: 'Visa/Mastercard',
        methodCode: 'cards',
        isEnabled: true,
        providers: '',
      });

      const dto = CountryAuthorityMethodFactory.createDtoWithProviders(entity);

      expect(dto).toStrictEqual({
        methodName: entity.methodName,
        methodCode: entity.methodCode,
        isEnabled: entity.isEnabled,
        providers: [],
      });
    });

    it('Should return DTO with unique elements in providers', () => {
      const entity = mock<CountryAuthorityMethodWithProvidersEntity>({
        methodName: 'Visa/Mastercard',
        methodCode: 'cards',
        isEnabled: true,
        providers: 'Stripe,Stripe,Ingenico,Ingenico,Nganluong',
      });

      const dto = CountryAuthorityMethodFactory.createDtoWithProviders(entity);

      expect(dto).toStrictEqual({
        methodName: entity.methodName,
        methodCode: entity.methodCode,
        isEnabled: entity.isEnabled,
        providers: ['Stripe', 'Ingenico', 'Nganluong'],
      });
    });
  });
});
