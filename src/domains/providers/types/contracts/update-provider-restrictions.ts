import { ProviderRestrictionsGroupDto } from '@domains/providers';

export interface UpdateProviderRestrictionsParams {
  providerCode: string;
  restrictions: ProviderRestrictionsGroupDto[];
}
