import {
  AuthorityEntity, BankAccountEntity,
  CountryAuthorityEntity,
  CountryAuthorityMethodEntity,
  CountryEntity, CredentialEntity,
  CurrencyEntity,
  Entity,
  FieldEntity,
  FieldEntityType,
  FieldOptionEntity,
  MethodEntity,
  PlatformEntity,
  ProviderEntity, ProviderFieldsEntity,
  ProviderMethodEntity,
  ProviderRestrictionsEntity, StpProviderRuleEntity, StpRuleEntity,
  TransactionConfigEntity,
} from '@core';
import { DbTable, dbSelectOne } from '@internal/component-test-library';

import {
  AuthorityBuilder,
  BankAccountBuilder,
  Builder,
  CountryAuthorityBuilder,
  CountryAuthorityMethodsBuilder, CountryBuilder,
  CredentialBuilder,
  CurrencyBuilder,
  FieldBuilder,
  FieldOptionBuilder,
  MethodsBuilder,
  PlatformBuilder,
  ProviderBuilder, ProviderFieldsBuilder,
  ProviderMethodsBuilder,
  ProviderRestrictionBuilder,
  StpProviderRulesBuilder,
  StpRuleBuilder,
  TransactionConfigBuilder,
} from './builders';

export interface DataSet {
  authority: AuthorityEntity;
  country: CountryEntity;
  currency: CurrencyEntity;
  method: MethodEntity;
  provider: ProviderEntity;
  countryAuthority: CountryAuthorityEntity;
  countryAuthorityMethod: CountryAuthorityMethodEntity;
  providerMethod: ProviderMethodEntity;
  transactionConfig: TransactionConfigEntity;
  field: FieldEntity;
  fieldOption: FieldOptionEntity;
  providerFields: ProviderFieldsEntity;
  platform: PlatformEntity;
  credential: CredentialEntity;
  providerRestriction: ProviderRestrictionsEntity;
  bankAccount: BankAccountEntity;
  stpRule: StpRuleEntity;
  stpProviderRule: StpProviderRuleEntity;
}

export class DataSetBuilder {
  private authority = new AuthorityBuilder();
  private country = new CountryBuilder();
  private currency = new CurrencyBuilder();
  private method = new MethodsBuilder();
  private provider = new ProviderBuilder();
  private countryAuthority = new CountryAuthorityBuilder();
  private countryAuthorityMethod = new CountryAuthorityMethodsBuilder();
  private providerMethod = new ProviderMethodsBuilder();
  private transactionConfig = new TransactionConfigBuilder();
  private field = new FieldBuilder();
  private fieldOption = new FieldOptionBuilder();
  private platform = new PlatformBuilder();
  private credential = new CredentialBuilder();
  private providerFields = new ProviderFieldsBuilder();
  private providerRestriction = new ProviderRestrictionBuilder();
  private bankAccount = new BankAccountBuilder();
  private stpRule = new StpRuleBuilder();
  private stpProviderRule = new StpProviderRulesBuilder();

  public static create(): DataSetBuilder {
    return new DataSetBuilder();
  }

  public withAuthority(authority: Partial<AuthorityEntity> = {}): DataSetBuilder {
    this.authority = this.authority.build(authority);
    return this;
  }

  public withCountry(country: Partial<CountryEntity> = {}): DataSetBuilder {
    this.country = this.country.build(country);
    return this;
  }

  public withCurrency(currency: Partial<CurrencyEntity> = {}): DataSetBuilder {
    this.currency = this.currency.build(currency);
    return this;
  }

  public withMethod(method: Partial<MethodEntity> = {}): DataSetBuilder {
    this.method = this.method.build(method);
    return this;
  }

  public withProvider(provider: Partial<ProviderEntity> = {}): DataSetBuilder {
    this.provider = this.provider.build(provider);
    return this;
  }

  public withStpRule(stpRule: Partial<StpRuleEntity> = {}): DataSetBuilder {
    this.stpRule = this.stpRule.build(stpRule);
    return this;
  }

  public withProviderRestriction(providerRestriction: Partial<ProviderRestrictionsEntity> = {}): DataSetBuilder {
    this.providerRestriction = this.providerRestriction.build({
      providerCode: this.provider.getEntity?.code,
      countryAuthorityId: this.countryAuthority.getEntity?.id,
      ...providerRestriction,
    });
    return this;
  };

  public withCountriesAuthorities(countryAuthority: Partial<CountryAuthorityEntity> = {}): DataSetBuilder {
    this.countryAuthority = this.countryAuthority.build({
      authorityFullCode: this.authority.getEntity?.fullCode,
      countryIso2: this.country.getEntity?.iso2,
      ...countryAuthority,
    });
    return this;
  }

  public withCountryAuthorityMethod(countryAuthorityMethod: Partial<CountryAuthorityMethodEntity> = {}): DataSetBuilder {
    this.countryAuthorityMethod = this.countryAuthorityMethod.build({
      methodId: this.method.getEntity?.id,
      countryAuthorityId: this.countryAuthority.getEntity?.id,
      ...countryAuthorityMethod,
    });
    return this;
  }

  public withProviderMethod(providerMethod: Partial<ProviderMethodEntity> = {}): DataSetBuilder {
    this.providerMethod = this.providerMethod.build({
      providerId: this.provider.getEntity?.id,
      countryAuthorityMethodId: this.countryAuthorityMethod.getEntity?.id,
      ...providerMethod,
    });
    return this;
  }

  public withTransactionConfig(transactionConfig: Partial<TransactionConfigEntity> = {}): DataSetBuilder {
    this.transactionConfig = this.transactionConfig.build({
      providerMethodId: this.providerMethod.getEntity?.id,
      currencyIso3: this.currency.getEntity?.iso3,
      ...transactionConfig,
    });
    return this;
  }

  public withField(field: Partial<FieldEntity> = {}): DataSetBuilder {
    this.field = this.field.build({
      entityId: this.providerMethod.getEntity?.id,
      entityType: FieldEntityType.PROVIDER_METHOD,
      ...field,
    });
    return this;
  }

  public withFieldOption(fieldOption: Partial<FieldOptionEntity> = {}): DataSetBuilder {
    this.fieldOption = this.fieldOption.build({
      fieldId: this.field.getEntity?.id,
      ...fieldOption,
    });
    return this;
  }

  public withCredential(credential: Partial<CredentialEntity> = {}): DataSetBuilder {
    this.credential = this.credential.build({
      providerCode: this.provider.getEntity?.code,
      authorityFullCode: this.authority.getEntity?.fullCode,
      countryIso2: this.country.getEntity?.iso2,
      ...credential,
    });
    return this;
  }

  public withProviderField(providerField: Partial<ProviderFieldsEntity> = {}): DataSetBuilder {
    this.providerFields = this.providerFields.build({
      providerCode: this.provider.getEntity?.code,
      countryIso2: this.country.getEntity?.iso2,
      authorityFullCode: this.authority.getEntity?.fullCode,
      ...providerField,
    });
    return this;
  }

  public withStpProviderRule(stpProviderRule: Partial<StpProviderRuleEntity> = {}): DataSetBuilder {
    this.stpProviderRule = this.stpProviderRule.build({
      authorityFullCode: this.authority.getEntity?.fullCode,
      countryIso2: this.country.getEntity?.iso2,
      providerCode: this.provider.getEntity?.code,
      ...stpProviderRule,
    });
    return this;
  }

  public withCA(): DataSetBuilder {
    return this
      .withAuthority()
      .withCountry()
      .withCountriesAuthorities({
        authorityFullCode: this.authority.getEntity?.fullCode,
        countryIso2: this.country.getEntity?.iso2,
      });
  }

  public withCAMethods(payload: Partial<CountryAuthorityMethodEntity> = {}): DataSetBuilder {
    return this
      .withCA()
      .withMethod()
      .withCountryAuthorityMethod({
        methodId: this.method.getEntity?.id,
        countryAuthorityId: this.countryAuthority.getEntity?.id,
        ...payload,
      });
  }

  public withProviderMethods(providerMethod: Partial<ProviderMethodEntity> = {}): DataSetBuilder {
    return this
      .withCAMethods()
      .withProvider()
      .withProviderMethod({
        providerId: this.provider.getEntity?.id,
        countryAuthorityMethodId: this.countryAuthorityMethod.getEntity?.id,
        ...providerMethod,
      });
  }

  public withConfigs(transactionConfig: Partial<TransactionConfigEntity> = {}): DataSetBuilder {
    return this
      .withProviderMethods()
      .withCurrency()
      .withTransactionConfig({
        providerMethodId: this.providerMethod.getEntity?.id,
        currencyIso3: this.currency.getEntity?.iso3,
        ...transactionConfig,
      });
  }

  public withPlatforms(platform: Partial<PlatformEntity> = {}): DataSetBuilder {
    this.platform = this.platform.build(platform);
    return this;
  }

  public withBankAccount(bankAccount: Partial<BankAccountEntity> = {}): DataSetBuilder {
    this.bankAccount = this.bankAccount.build({
      providerCode: this.provider.getEntity?.code,
      authorityFullCode: this.authority.getEntity?.fullCode,
      countryIso2: this.country.getEntity?.iso2,
      currencyIso3: this.currency.getEntity?.iso3,
      ...bankAccount,
    });
    return this;
  }

  public async build(): Promise<DataSet> {
    const entities = this.getEntitiesByFK();
    const dataSet: Partial<DataSet> = {};

    for (const [entityName, entityBuilder] of Object.entries(entities)) {
      if (entityBuilder.getEntity === null) {
        continue;
      }

      const value = await this.insert(entityBuilder.getEntity, entityBuilder.tableName);

      Object.assign(dataSet, { [entityName]: value });
    }

    return dataSet as DataSet;
  }

  private async insert(entity: Entity | null, tableName: DbTable): Promise<Entity> {
    if (entity === null) {
      throw new Error('Please use build first');
    }

    await global.knexSession(tableName).insert(entity).onConflict('*').merge();

    if (entity.id) {
      return await dbSelectOne(tableName, { id: entity.id }) as Entity;
    }

    return await dbSelectOne(tableName, entity) as Entity;
  }

  private getEntitiesByFK(): Record<keyof DataSet, Builder<Entity>> {
    return {
      authority: this.authority,
      country: this.country,
      currency: this.currency,
      method: this.method,
      provider: this.provider,
      countryAuthority: this.countryAuthority,
      countryAuthorityMethod: this.countryAuthorityMethod,
      providerMethod: this.providerMethod,
      transactionConfig: this.transactionConfig,
      field: this.field,
      fieldOption: this.fieldOption,
      providerFields: this.providerFields,
      platform: this.platform,
      credential: this.credential,
      providerRestriction: this.providerRestriction,
      bankAccount: this.bankAccount,
      stpRule: this.stpRule,
      stpProviderRule: this.stpProviderRule,
    };
  }
}
