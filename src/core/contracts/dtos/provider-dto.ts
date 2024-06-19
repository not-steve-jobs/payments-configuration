import { ProviderType } from '@core/contracts';

export interface ProviderBaseDto {
  name: string;
  code: string;
  isEnabled: boolean;
}

export interface ProviderDto extends ProviderBaseDto {
  type: ProviderType;
}
