import { Cache, UseCase } from '@core';
import { ProviderMethodRepository } from '@infra/repos';
import { CsvConverter } from '@domains/provider-methods/services';

import { BUILD_NEW_FILE_NAME, STATS_FIELDS_ORDERED } from './constants';
import { ExportLimitsResponse } from './types';

export interface ExportLimitsOptions {
  providerMethodRepository: ProviderMethodRepository;
}

export class ExportLimits extends UseCase<void, ExportLimitsResponse> {
  private readonly providerMethodRepository: ProviderMethodRepository;

  constructor(options: ExportLimitsOptions) {
    super(options);

    this.providerMethodRepository = options.providerMethodRepository;
  }

  public async execute(): Promise<ExportLimitsResponse> {
    return { fileName: BUILD_NEW_FILE_NAME(), data: await this.getLimitsStatsCSV() };
  }

  @Cache()
  private async getLimitsStatsCSV(): Promise<string> {
    const stats = await this.providerMethodRepository.getLimitsStats();

    return CsvConverter.convert(stats, STATS_FIELDS_ORDERED);
  }
}
