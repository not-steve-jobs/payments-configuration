import { ProviderMethodWithCountryAuthority } from '@core';

import { ProviderCASettingsDto } from '../../../types';

import { UpdateProviderSettingsValidator } from './update-provider-settings-validator';

describe('UpdateProviderSettingsValidator', () => {
  describe('#validatecountryAuthoritySettings', () => {
    it('Should throw ERR_NOT_FOUND if got unknown country-authority', () => {
      const countryAuthoritySettings = [
        mock<ProviderCASettingsDto>({ country: 'AR', authority: 'GM', settings: {} }),
      ];
      const providerMethods = [
        mock<ProviderMethodWithCountryAuthority>({ countryIso2: 'AR', authorityFullCode: 'CYSEC' }),
      ];

      expect(() => UpdateProviderSettingsValidator.validate({
        countryAuthoritySettings,
        providerMethods,
        boundedCurrenciesToMethods: [],
      }))
        .toThrow('In the request there are countries-authorities that are not mapped to the provider');
    });

    it('Should throw ERR_CONFLICT if country-authority is missing', () => {
      const countryAuthoritySettings = [
        mock<ProviderCASettingsDto>({ country: 'AR', authority: 'GM', settings: {} }),
      ];
      const providerMethods = [
        mock<ProviderMethodWithCountryAuthority>({ countryIso2: 'AR', authorityFullCode: 'CYSEC' }),
        mock<ProviderMethodWithCountryAuthority>({ countryIso2: 'AR', authorityFullCode: 'GM' }),
      ];

      expect(() => UpdateProviderSettingsValidator.validate({
        countryAuthoritySettings,
        providerMethods,
        boundedCurrenciesToMethods: [],
      }))
        .toThrow(`Settings for "AR:CYSEC" missed in request`);
    });

    it('Should throw ERR_CONFLICT if countryAuthoritySettings contains duplicates', () => {
      const countryAuthoritySettings = [
        mock<ProviderCASettingsDto>({ country: 'AR', authority: 'GM', settings: {} }),
        mock<ProviderCASettingsDto>({ country: 'AR', authority: 'GM', settings: {} }),
      ];
      const providerMethods = [
        mock<ProviderMethodWithCountryAuthority>({ countryIso2: 'AR', authorityFullCode: 'GM' }),
      ];

      expect(() => UpdateProviderSettingsValidator.validate({
        countryAuthoritySettings,
        providerMethods,
        boundedCurrenciesToMethods: [],
      }))
        .toThrow('In the request there are countries-authorities with duplicates');
    });

    it('Should pass', () => {
      const countryAuthoritySettings = [
        mock<ProviderCASettingsDto>({ country: 'AR', authority: 'GM', settings: {} }),
        mock<ProviderCASettingsDto>({ country: 'AR', authority: 'CYSEC', settings: {} }),
      ];
      const providerMethods = [
        mock<ProviderMethodWithCountryAuthority>({ countryIso2: 'AR', authorityFullCode: 'GM' }),
        mock<ProviderMethodWithCountryAuthority>({ countryIso2: 'AR', authorityFullCode: 'CYSEC' }),
      ];

      expect(() => UpdateProviderSettingsValidator.validate({
        countryAuthoritySettings,
        providerMethods,
        boundedCurrenciesToMethods: [],
      }))
        .not.toThrow();
    });
  });
});
