import { ProviderRestrictionsDto, ProviderRestrictionsGroupDto } from '@domains/providers';
import {
  CountryAuthorityDto,
  CountryAuthorityEntity,
  ProviderRestrictionsEntity,
} from '@core';
import { equalsIgnoringCase } from '@utils';

interface CreateEntityParams {
  providerCode: string;
  countriesAuthorities: CountryAuthorityEntity[];
  restrictions: ProviderRestrictionsGroupDto[];
}

export class ProviderRestrictionsMapper {
  public static createEntities({ providerCode, countriesAuthorities, restrictions }: CreateEntityParams): ProviderRestrictionsEntity[] {
    const entities: ProviderRestrictionsEntity[] = [];

    for (const restriction of restrictions) {
      const restrictionCAs = restriction.countriesAuthorities;

      if (!restrictionCAs.length) {
        entities.push({
          providerCode,
          countryAuthorityId: null,
          platform: restriction.platform,
          isEnabled: restriction.isEnabled,
          settings: JSON.stringify(restriction.settings),
        });
        continue;
      }

      for (const { country, authority } of restrictionCAs) {
        const countryAuthorityId = countriesAuthorities.find(ca =>
          equalsIgnoringCase(ca.authorityFullCode, authority) && equalsIgnoringCase(ca.countryIso2, country))?.id || null;

        entities.push({
          providerCode,
          countryAuthorityId,
          platform: restriction.platform,
          isEnabled: restriction.isEnabled,
          settings: JSON.stringify(restriction.settings),
        });
      }
    }

    return entities;
  }

  public static createGroup(restrictions: ProviderRestrictionsDto[]): ProviderRestrictionsGroupDto[] {
    const settingsMap = new Map<string, ProviderRestrictionsGroupDto>();

    for (const restriction of restrictions) {
      const key = `${restriction.platform}:${restriction.settings}`;
      const group = settingsMap.get(key);
      const { authority, country } = restriction;
      const countryAuthority: CountryAuthorityDto | null = authority && country ? { authority, country } : null;

      if (group && countryAuthority) {
        group.countriesAuthorities.push(countryAuthority);
      } else {
        const newGroup: ProviderRestrictionsGroupDto = {
          platform: restriction.platform,
          isEnabled: restriction.isEnabled,
          countriesAuthorities: countryAuthority ? [countryAuthority] : [],
          settings: JSON.parse(restriction.settings),
        };
        settingsMap.set(key, newGroup);
      }
    }

    return Array.from(settingsMap.values());
  }
}
