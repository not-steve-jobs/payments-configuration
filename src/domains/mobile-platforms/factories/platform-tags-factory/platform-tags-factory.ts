import { randomUUID } from 'crypto';

import { RepositoryTag } from '@infra/services';
import { MobilePlatforms, PlatformEntity } from '@core';

export class PlatformTagsFactory {
  public static readonly MOBILE_TAG_PATTERN = /^\d+\.\d+\.\d+$/;

  public static createPlatformTags(tags: RepositoryTag[], platform: MobilePlatforms): PlatformEntity[] {
    const filteredTags = tags.filter(tag => PlatformTagsFactory.MOBILE_TAG_PATTERN.test(tag.name));
    return this.createPlatformEntities(filteredTags, platform);
  }

  private static createPlatformEntities(tags: RepositoryTag[], platform: MobilePlatforms): PlatformEntity[] {
    return tags.map(tag => ({
      id: randomUUID(),
      name: platform,
      version: tag.name,
      date: new Date(tag.target.date),
    }));
  }
}
