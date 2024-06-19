import { PlatformEntity, UseCase } from '@core';
import { PlatformsRepository } from '@infra';
import { GetPlatformVersionsResponse } from '@domains/mobile-platforms';

interface GetPlatformVersionsServiceOptions {
  platformsRepository: PlatformsRepository;
}

export class GetPlatformVersions extends UseCase<void, GetPlatformVersionsResponse> {
  private readonly platformsRepository: PlatformsRepository;

  constructor(options: GetPlatformVersionsServiceOptions) {
    super(options);
    this.platformsRepository = options.platformsRepository;
  }

  public async execute(): Promise<GetPlatformVersionsResponse> {
    const platformVersions = await this.platformsRepository.findAll();

    return platformVersions.reduce((response: GetPlatformVersionsResponse, pv: PlatformEntity) => {
      response[pv.name].push(pv.version);
      return response;
    }, { android: [], ios:[] });
  }
}
