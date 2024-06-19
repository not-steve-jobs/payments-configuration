export interface ProviderMethodCodesDto {
  providerCode: string;
  methodCode: string;
}

export interface ProviderMethodDto extends ProviderMethodCodesDto {
  providerName: string;
  methodName: string;
}
