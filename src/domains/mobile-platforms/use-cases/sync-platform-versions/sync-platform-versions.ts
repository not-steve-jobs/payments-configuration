import { ApplicationPlatforms, MobilePlatforms, PlatformEntity, UseCase } from '@core';
import { PlatformsRepository } from '@infra';
import { BitbucketSdk, RepositoryTag } from '@infra/services';
import { PlatformTagsFactory } from '@domains/mobile-platforms/factories';

interface SyncPlatformVersionsServiceOptions {
  androidBitbucketSdk: BitbucketSdk;
  iosBitbucketSdk: BitbucketSdk;
  platformsRepository: PlatformsRepository;
}


export class SyncPlatformVersions extends UseCase<void, { message: string }> {
  private readonly bitbucketSDKs: Record<MobilePlatforms, BitbucketSdk>;
  private readonly platformsRepository: PlatformsRepository;

  constructor(options: SyncPlatformVersionsServiceOptions) {
    super(options);
    this.bitbucketSDKs = {
      [ApplicationPlatforms.ANDROID]: options.androidBitbucketSdk,
      [ApplicationPlatforms.IOS]: options.iosBitbucketSdk,
    };
    this.platformsRepository = options.platformsRepository;
  }

  public async execute(): Promise<{ message: string }> {
    const tags = (await Promise.all([
      this.getPlatformTags(ApplicationPlatforms.ANDROID),
      this.getPlatformTags(ApplicationPlatforms.IOS),
    ])).flat();
    await this.platformsRepository.upsert(tags);
    return { message: 'Sync has been successfully finished!' };
  }

  private async getPlatformTags(platform: MobilePlatforms): Promise<PlatformEntity[]> {
    const tags: RepositoryTag[] = await this.bitbucketSDKs[platform].getRepositoryTags();
    return PlatformTagsFactory.createPlatformTags(tags, platform);
  }
}
