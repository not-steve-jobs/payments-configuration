import { CountryAuthorityRepository, ProviderRestrictionsRepository } from '@infra/repos';
import { Condition, ProviderRestrictionSettings, ProviderRestrictionsDto } from '@domains/providers';

export interface PlatformVersionsRestrictionsServiceOptions {
  providerRestrictionsRepository: ProviderRestrictionsRepository;
  countryAuthorityRepository: CountryAuthorityRepository;
}

export interface RestrictionParameters {
  providerCodes: string[];
  country: string;
  authority: string;
  platform: string;
  version: string;
}

export class PlatformVersionsRestrictionsService {
  private readonly countryAuthorityRepository: CountryAuthorityRepository;
  private readonly providerRestrictionsRepository: ProviderRestrictionsRepository;

  constructor(options: PlatformVersionsRestrictionsServiceOptions) {
    this.countryAuthorityRepository = options.countryAuthorityRepository;
    this.providerRestrictionsRepository = options.providerRestrictionsRepository;
  }

  private compareAppVersions(version1: string, version2: string, condition: Condition): boolean {
    if (!Object.values(Condition).includes(condition)) {
      throw new Error('unknown condition');
    }

    if (condition === Condition.EQ) {
      return version1 === version2;
    }

    const multiplier = condition === Condition.GTE ? 1 : -1;
    const splitVersion1 = version1.split('.').map(v => Number(v) * multiplier);
    const splitVersion2 = version2.split('.').map(v => Number(v) * multiplier);

    for (let i = 0; i < Math.max(splitVersion1.length, splitVersion2.length); i++) {
      const num1 = splitVersion1[i] || 0;
      const num2 = splitVersion2[i] || 0;

      if (num1 > num2) {
        return true;
      } else if (num1 < num2) {
        return false;
      }
    }

    return true; // Versions are equal
  }

  private isAllowed(providerRestrictionsDto: ProviderRestrictionsDto, version: string): boolean {
    if (!providerRestrictionsDto.isEnabled) {
      return true;
    }

    const settings: ProviderRestrictionSettings[] = JSON.parse(providerRestrictionsDto.settings);
    if (!settings.length) {
      return false;
    }

    const versionComparator = (setting: ProviderRestrictionSettings): boolean => this.compareAppVersions(version, setting.version, setting.condition);
    const isOnlyEq = settings.every(s => s.condition === Condition.EQ);

    return isOnlyEq ? settings.some(versionComparator) : settings.every(versionComparator);
  }

  public async getAllowed(params: RestrictionParameters): Promise<Set<string>> {
    const countryAuthority = await this.countryAuthorityRepository.findOne({ authorityFullCode: params.authority, countryIso2: params.country });
    if (!countryAuthority) {
      return new Set<string>();
    }

    const providerRestrictionsList = await this.providerRestrictionsRepository.getProviderRestrictionsByPlatformAndCA(
      params.platform,
      countryAuthority.id
    );

    return new Set(params.providerCodes.filter(provider => {
      const providerRestrictions = providerRestrictionsList.find(r => provider === r.providerCode);

      return providerRestrictions ? this.isAllowed(providerRestrictions, params.version) : true;
    }));
  }
}
