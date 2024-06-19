import { CredentialDto } from '@core';
import { CredentialsData, CredentialsDataParameters } from '@domains/providers/types';

export class CredentialsDataMapper {
  private static credentialToParameterMap: Partial<Record<keyof CredentialDto, string>> = {
    authorityFullCode: 'authority',
    currencyIso3: 'currency',
    countryIso2: 'country',
  };

  private static createNewCredentialParameters(credential: CredentialDto): CredentialsDataParameters {
    return  Object.entries(credential).reduce<CredentialsDataParameters>((acc, [key, value]) => {
      const parameter = this.credentialToParameterMap[key as keyof CredentialDto];

      if (parameter && value !== null) {
        acc[parameter] = value;
      }

      return acc;
    }, {} as CredentialsDataParameters);
  }

  public static mapToCredentialsData(credentials: CredentialDto[]): CredentialsData[] {
    return credentials.reduce((acc, credential) => {
      acc.push({ parameters: this.createNewCredentialParameters(credential), credentialsDetails: credential.credentialsDetails });

      return acc;
    }, [] as CredentialsData[]);
  }
}
