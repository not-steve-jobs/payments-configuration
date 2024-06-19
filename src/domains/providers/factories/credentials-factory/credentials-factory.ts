import {
  CredentialsData,
} from '@domains/providers/types';
import { CredentialEntity } from '@core';

export class CredentialsFactory {
  public static createUpdateEntities(providerCode: string, credentialsData: CredentialsData[]): CredentialEntity[] {
    const parametersToEntity = new Map<string, CredentialEntity>();

    for (const { parameters, credentialsDetails } of credentialsData) {
      const key = JSON.stringify(parameters);

      const entity: CredentialEntity = parametersToEntity.get(key) ?? {
        providerCode,
        authorityFullCode: parameters.authority || null,
        currencyIso3: parameters.currency || null,
        countryIso2: parameters.country || null,
        credentialsDetails: '',
      };
      entity.credentialsDetails = JSON.stringify(credentialsDetails);

      parametersToEntity.set(key, entity);
    }

    return Array.from(parametersToEntity.values());
  }
}
