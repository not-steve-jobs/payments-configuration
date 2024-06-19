import { ProviderMethodDto } from '@domains/provider-methods';

export class ProviderMethodMapper {
  public static mapPMToPMCodesDto(withdrawal: ProviderMethodDto[]): ProviderMethodDto[] {
    return withdrawal.map(w => ({
      providerCode: w.providerCode,
      methodCode: w.methodCode,
      providerName: w.providerName,
      methodName: w.methodName,
    }));
  }
}
