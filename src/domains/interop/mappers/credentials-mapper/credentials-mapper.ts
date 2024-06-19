import { KeyValueConfig } from '@domains/interop';
import { CredentialDto } from '@core/contracts/dtos';

export class CredentialsMapper {
  public static mapToCredentialsDto(credentials: CredentialDto[], currencyIso3?: string): KeyValueConfig[] {
    const shared = credentials.filter(c => c.currencyIso3 === null);
    const specific = credentials.filter(c => c.currencyIso3 && currencyIso3 && c.currencyIso3.toLowerCase() === currencyIso3.toLowerCase());

    return Array.from([...shared, ...specific].reduce((acc, credential) => {
      credential.credentialsDetails.forEach(cd => {
        acc.set(cd.key, cd);
      });

      return acc;
    }, new Map<string, KeyValueConfig>()).values());
  }
}
