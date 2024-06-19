interface BindableEntity {
  providerCode: string;
  authorityFullCode: string | null;
  currencyIso3: string | null;
  countryIso2: string | null;
}

export interface GetBoundedEntitiesParams {
  providerCode: string;
  authorityFullCode: string;
  currencyIso3: string;
  countryIso2: string;
}

export class CountryAuthorityBoundedEntityManager {
  private static isBoundedTo<T extends BindableEntity>(entity: T, key: keyof T, value: string): boolean {
    const entityValue = entity[key] as string | null;

    return entityValue === null || entityValue.toLowerCase() === value.toLowerCase();
  }

  public static getBoundedEntities<T extends BindableEntity>(entities: T[], params: GetBoundedEntitiesParams): T[] {
    return entities.filter(c =>
      this.isBoundedTo(c, 'authorityFullCode', params.authorityFullCode)
      && this.isBoundedTo(c, 'countryIso2', params.countryIso2)
      && this.isBoundedTo(c, 'currencyIso3', params.currencyIso3)
    );
  }
}
