import { CredentialDetails, CredentialsData, CredentialsGroupedData } from '@domains/providers';
import { PspCredentialsData, PspCredentialsParameters, PspCredentialsResponse } from '@infra';
import { BadRequestError } from '@internal/errors-library';

export class PspCredentialsDataMapper {
  public static mapToCredentialsData({ credentialsData: credentials }: PspCredentialsResponse): CredentialsData[] {
    return credentials.map(({ credentialsDetails: creds, parameters }) => {
      const credentialsDetails = this.generateKeyValueCredentials(creds);

      Object.keys(parameters).forEach(key => {
        parameters[key as keyof PspCredentialsParameters] = parameters[key as keyof PspCredentialsParameters]?.toUpperCase();
      });

      return { credentialsDetails, parameters };
    });
  }

  public static mapToPspCredentials(creds: CredentialsGroupedData[]): PspCredentialsResponse {
    const credentialsData: PspCredentialsData[] = [];
    let defaultCredentials: Record<string, string> | null = null;

    for (const cred of creds) {
      if (!Object.keys(cred.parameters).length) {
        defaultCredentials = this.generateRecordCredentials(cred.credentialsDetails);
        const credentialsDetails = this.generateRecordCredentials(cred.credentialsDetails);

        if (Object.keys(credentialsDetails).length) {
          credentialsData.push({
            parameters: {},
            credentialsDetails,
          });
        }
        continue;
      }

      const pspCreds = this.unmapCredentials(cred);
      credentialsData.push(...pspCreds);
    }

    if (defaultCredentials) {
      credentialsData.forEach(c => c.credentialsDetails = {  ...defaultCredentials, ...c.credentialsDetails });
    }

    return { credentialsData };
  }

  private static generateKeyValueCredentials(creds: Record<string, string>): CredentialDetails[] {
    return Object.entries(creds).map(([key, value]) => ({ key, value }));
  }

  private static generateRecordCredentials(creds: CredentialDetails[]): Record<string, string> {
    return creds.reduce((result: Record<string, string>, { key, value }) => {
      result[key] = value;
      return result;
    }, {});
  }

  private static unmapCredentials({ parameters, credentialsDetails }: CredentialsGroupedData): PspCredentialsData[] {
    const pspCredentialsData: PspCredentialsData[] = [];

    if (!parameters.countryAuthorities || !parameters.currencies) {
      throw new BadRequestError('Not all parameters present!');
    }

    for (const ca of parameters.countryAuthorities) {
      const pspCredentials = this.generateRecordCredentials(credentialsDetails);

      if (!ca.authority || !ca.country) {
        throw new BadRequestError('Not all parameters present!');
      }

      for (const currency of parameters.currencies) {
        pspCredentialsData.push({
          parameters: {
            authority: ca.authority.toUpperCase(),
            country: ca.country.toUpperCase(),
            currency: currency.toUpperCase(),
          },
          credentialsDetails: pspCredentials,
        });
      }
    }

    return pspCredentialsData;
  }
}
