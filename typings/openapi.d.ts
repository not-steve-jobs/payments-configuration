import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios'; 

declare namespace Components {
    namespace Parameters {
        export type AuthorityHeader = /**
         * example:
         * FSCM
         */
        Schemas.Authority;
        export type CountryHeader = /**
         * example:
         * CY
         */
        Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
        export type ProviderCodeHeader = /**
         * example:
         * stripe
         */
        Schemas.ProviderCode;
    }
    export interface QueryParameters {
        authorityHeader?: Parameters.AuthorityHeader;
        countryHeader?: Parameters.CountryHeader;
        providerCodeHeader?: Parameters.ProviderCodeHeader;
    }
    namespace RequestBodies {
        export interface UpdateCountryAuthorityMethodStatus {
            isEnabled: boolean;
        }
        export type UpdateProviderMethodConfigs = {
            providerCode: string;
            isEnabled: boolean;
            currencySettings: {
                currency: /**
                 * example:
                 * USD
                 */
                Schemas.CurrencyIso3 /* ^[A-Z]+$ */;
                deposit: {
                    minAmount: Schemas.MinAmount /* double */;
                    maxAmount: Schemas.MaxAmount /* double */;
                    isEnabled: boolean;
                };
                payout?: {
                    minAmount: Schemas.MinAmount /* double */;
                    maxAmount: Schemas.MaxAmount /* double */;
                    isEnabled: boolean;
                };
                refund?: {
                    minAmount: Schemas.MinAmount /* double */;
                    period: Schemas.Period;
                    isEnabled: boolean;
                };
            }[];
        }[];
    }
    namespace Responses {
        export type BadRequest = Schemas.Error;
        export type Conflict = Schemas.Error;
        export type ContentTooLarge = Schemas.Error;
        export type CredentialsOverlapError = Schemas.Error;
        export type Forbidden = Schemas.Error;
        export type MaxAllowedCurrenciesExceededError = Schemas.Error;
        export type NoContent = Schemas.Error;
        export type NotFound = Schemas.Error;
        export interface ServerError {
        }
        export type Unauthorized = Schemas.Error;
        export type Validation = Schemas.Error;
        export type ValidationError = Schemas.Error;
    }
    namespace Schemas {
        export type ApplicationPlatforms = "web" | "android" | "ios";
        /**
         * example:
         * FSCM
         */
        export type Authority = string;
        export interface BankAccount {
            name: string;
            type: string;
            configs: {
                key: string;
                value: string;
            }[];
        }
        export type BankAccountData = {
            parameters: BankAccountsParametersGroup;
            bankAccounts: BankAccount[];
        }[];
        export interface BankAccountUpdate {
            name: string;
            type: string;
            configs: [
                {
                    key: string;
                    value: string;
                },
                ...{
                    key: string;
                    value: string;
                }[]
            ];
        }
        export type BankAccountUpdateData = {
            parameters: BankAccountsParametersGroup;
            bankAccounts: [
                BankAccountUpdate,
                ...BankAccountUpdate[]
            ];
        }[];
        export interface BankAccountsParametersGroup {
            countryAuthorities: [
                {
                    country: CountryIso2Nullable;
                    authority: /**
                     * example:
                     * FSCM
                     */
                    Authority;
                },
                ...{
                    country: CountryIso2Nullable;
                    authority: /**
                     * example:
                     * FSCM
                     */
                    Authority;
                }[]
            ];
            currencies: [
                string,
                ...string[]
            ];
        }
        export interface Country {
            iso2: string; // ^[A-Z]{2}$
            iso3: string; // ^[A-Z]{3}$
            name: string;
            group?: string;
        }
        export interface CountryAuthorityDto {
            country: /**
             * example:
             * CY
             */
            CountryIso2 /* ^[A-Za-z]{2}$ */;
            authority: /**
             * example:
             * FSCM
             */
            Authority;
        }
        export interface CountryAuthorityMethodDto {
            country: /**
             * example:
             * CY
             */
            CountryIso2 /* ^[A-Za-z]{2}$ */;
            authority: /**
             * example:
             * FSCM
             */
            Authority;
            method: MethodCode;
        }
        export interface CountryConfig {
            countryGroup?: string;
            countryData?: {
                countryCode?: string;
                countryName?: string;
                authorities?: /**
                 * example:
                 * FSCM
                 */
                Authority[];
            };
        }
        /**
         * example:
         * CY
         */
        export type CountryIso2 = string; // ^[A-Za-z]{2}$
        export type CountryIso2Nullable = /**
         * example:
         * CY
         */
        CountryIso2 /* ^[A-Za-z]{2}$ */ | (string | null);
        export type CredentialsGroupData = {
            parameters: {
                countryAuthorities?: {
                    [key: string]: any;
                }[];
                currencies?: string[];
            };
            credentialsDetails: {
                key?: string;
                value?: string;
            }[];
        }[];
        export type CredentialsGroupDataUpdate = {
            parameters: ParametersGroup;
            credentialsDetails: {
                key: string;
                value: string;
            }[];
        }[];
        export type CurrencyConfigs = {
            currency: /**
             * example:
             * USD
             */
            CurrencyIso3 /* ^[A-Z]+$ */;
            deposit: {
                minAmount: MinAmount /* double */;
                maxAmount: MaxAmount /* double */;
                isEnabled: boolean;
            };
            payout?: {
                minAmount: MinAmount /* double */;
                maxAmount: MaxAmount /* double */;
                isEnabled: boolean;
            };
            refund?: {
                minAmount: MinAmount /* double */;
                period: Period;
                isEnabled: boolean;
            };
        }[];
        export type CurrencyConfigsUpdateDto = {
            currency: /**
             * example:
             * USD
             */
            CurrencyIso3 /* ^[A-Z]+$ */;
            deposit?: {
                minAmount?: MinAmount /* double */;
                maxAmount?: MaxAmount /* double */;
                isEnabled?: boolean;
            };
            payout?: {
                minAmount?: MinAmount /* double */;
                maxAmount?: MaxAmount /* double */;
                isEnabled?: boolean;
            };
            refund?: {
                minAmount?: MinAmount /* double */;
                period?: Period;
                isEnabled?: boolean;
            };
        }[];
        /**
         * example:
         * USD
         */
        export type CurrencyIso3 = string; // ^[A-Z]+$
        export interface Error {
            code: string;
            message?: string;
            requestId: string;
            meta?: {
                [key: string]: any;
            };
        }
        export interface Field {
            key: string; // ^[a-zA-Z0-9&()\-._ī,:\s]+$
            name?: string;
            defaultValue?: string;
            fieldType: FieldValueType;
            transactionType: FieldTransactionType;
            pattern: string;
            isEnabled: boolean;
            isMandatory: boolean;
            options: {
                key: string;
                value: string;
                isEnabled: boolean;
            }[];
        }
        export type FieldTransactionType = "deposit" | "refund" | "payout";
        export type FieldValueType = "bool" | "string" | "select";
        export type InteropMethodFields = {
            key?: string;
            name?: string;
            type?: string;
            required?: boolean;
            validation?: string;
            options?: {
                key?: string | null;
                description?: string | null;
                enabled?: boolean | null;
            }[];
        }[];
        export interface InteropStpProviderRule {
            isEnabled?: boolean;
            id?: number;
            /**
             * example:
             * allowedProfileStatuses
             */
            key?: string;
            /**
             * example:
             * Profile Status should be in [<List to be provided>]
             */
            description?: string;
            allowType?: number | null;
            /**
             * example:
             * list
             */
            valueType?: string | null;
            enforceAuto?: boolean | null;
            value?: string[] | string | ({
                [key: string]: any;
            } | null);
            orderId?: number;
        }
        export type MaxAmount = number | null; // double
        export type MethodCode = string;
        export interface MethodDto {
            code: string; // ^[A-Za-z0-9_]{1,50}$
            name: string; // ^(?=.*[^\s]).{1,100}$
            description: string;
        }
        export type MinAmount = number | null; // double
        export interface ParametersGroup {
            countryAuthorities?: [
                {
                    country: /**
                     * example:
                     * CY
                     */
                    CountryIso2 /* ^[A-Za-z]{2}$ */;
                    authority: /**
                     * example:
                     * FSCM
                     */
                    Authority;
                },
                ...{
                    country: /**
                     * example:
                     * CY
                     */
                    CountryIso2 /* ^[A-Za-z]{2}$ */;
                    authority: /**
                     * example:
                     * FSCM
                     */
                    Authority;
                }[]
            ];
            currencies?: [
                string,
                ...string[]
            ];
        }
        export interface PaymentMethodConfig {
            methodCode?: string;
            methodName?: string;
            isEnabled?: boolean;
            /**
             * Provider names
             */
            providers?: string[];
        }
        export interface PaymentsConfig {
            currency: string;
            providers: {
                key: string;
                name: string;
                maintenance?: boolean;
                depositSettings?: {
                    min?: MinAmount /* double */;
                    max?: MaxAmount /* double */;
                    enabled?: boolean;
                    fields: InteropMethodFields;
                };
                payoutSettings: {
                    min?: MinAmount /* double */;
                    max?: MaxAmount /* double */;
                    enabled?: boolean;
                    order?: number;
                    paymentAccountRequired?: boolean;
                    fields: InteropMethodFields;
                };
                refundSettings?: {
                    order?: number;
                    enabled?: boolean;
                    minRefundableAmountThreshold?: null | number;
                    maxRefundablePeriodInDays?: null | number;
                    isRequestDetailsRequired?: boolean | null;
                };
                stpSettings: {
                    [key: string]: any;
                };
                stpAllowed: boolean;
                stpMinDepositsCount: number;
                stpMaxDepositAmount: number;
                defaultLeverage: number;
                transactionRejectApplicable: boolean;
                config?: {
                    key: string;
                    value: string;
                }[];
                settings?: any[];
                fields?: any[];
                withdrawalFields?: any[];
                accounts?: any[];
            }[];
        }
        export interface PaymentsDepositConfig {
            key?: string;
            description?: string;
            provider?: string;
            currencySettings?: {
                currency?: string;
                min?: MinAmount /* double */;
                max?: MaxAmount /* double */;
            }[];
            convertedCurrency?: string | null;
            defaultCurrency?: string | null;
            type?: string;
            fields?: {
                key?: string;
                value?: string;
                pattern?: string;
                options?: {
                    key?: string;
                    value?: string;
                }[];
            }[];
        }
        export type Period = null | number;
        export interface PlatformVersions {
            android?: string[];
            ios?: string[];
        }
        export interface Provider {
            code?: string;
            name?: string;
            isEnabled?: boolean;
            type?: string;
        }
        export interface ProviderBase {
            code?: string;
            name?: string;
            isEnabled?: boolean;
        }
        /**
         * example:
         * stripe
         */
        export type ProviderCode = string;
        export interface ProviderConfig {
            providerCode: string;
            providerName: string;
            isEnabled: boolean;
            currencySettings: CurrencyConfigs;
        }
        export interface ProviderFields {
            common?: Field[];
            specific?: {
                parameters?: SpecificParameters;
                fields?: Field;
            };
        }
        export interface ProviderMethod {
            providerCode: string;
            methodCode: string;
            providerName?: string;
            methodName?: string;
        }
        export interface ProviderMethodBoundedDto {
            methodCode?: string;
            methodName?: string;
            state?: "bounded" | "mixed" | "not_bounded";
        }
        export type ProviderRestrictions = {
            platform: ApplicationPlatforms;
            isEnabled: boolean;
            countriesAuthorities: [
                CountryAuthorityDto,
                ...CountryAuthorityDto[]
            ];
            settings: RestrictionSetting[];
        }[];
        export interface ProviderSettings {
            provider: {
                type: ProviderType;
                convertedCurrency: string | null;
            };
            countryAuthoritySettings: {
                country: string;
                authority: string;
                settings: {
                    isPayoutAsRefund: boolean;
                    isPaymentAccountRequired: boolean;
                    defaultCurrency?: {
                        currency: /**
                         * example:
                         * USD
                         */
                        CurrencyIso3 /* ^[A-Z]+$ */;
                        isEnabled: boolean;
                        methods: [
                            string,
                            ...string[]
                        ];
                    } | null;
                };
            }[];
        }
        export type ProviderType = "default" | "crypto" | "bankwire";
        export interface RestrictionSetting {
            condition: "gte" | "lte" | "eq";
            version: string; // ^\d+\.\d+\.\d+$
        }
        export interface SpecificParameters {
            countriesAuthorities?: {
                authority?: /**
                 * example:
                 * FSCM
                 */
                Authority;
                country?: /**
                 * example:
                 * CY
                 */
                CountryIso2 /* ^[A-Za-z]{2}$ */;
            }[];
            currencies?: string[];
        }
        export interface StpProviderRulesDto {
            isEnabled: boolean;
            countriesAuthorities: [
                {
                    authority: /**
                     * example:
                     * FSCM
                     */
                    Authority;
                },
                ...{
                    authority: /**
                     * example:
                     * FSCM
                     */
                    Authority;
                }[]
            ];
            stpRules: [
                {
                    key: string;
                    isEnabled: boolean;
                    type?: "number" | "list";
                    value?: string | (string[] | null);
                },
                ...{
                    key: string;
                    isEnabled: boolean;
                    type?: "number" | "list";
                    value?: string | (string[] | null);
                }[]
            ];
        }
        export interface StpRule {
            key?: string;
            description?: string | null;
            order?: number;
            data?: {
                valueType?: "bool" | "number" | "string" | "list";
                value?: boolean | number | string | any[];
            } | null;
        }
        export interface SyncResponse {
            message?: string;
        }
        export interface WithdrawalsOrder {
            refunds: ProviderMethod[];
            payouts: ProviderMethod[];
        }
    }
}
declare namespace Paths {
    namespace AddCountry {
        export interface RequestBody {
            iso2: string; // ^[A-Z]{2}$
            iso3: string; // ^[A-Z]{3}$
            name: string;
            group?: string;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Country;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $422 = Components.Responses.ValidationError;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace AddCurrency {
        export interface RequestBody {
            iso3: /**
             * example:
             * USD
             */
            Components.Schemas.CurrencyIso3 /* ^[A-Z]+$ */;
        }
        namespace Responses {
            export interface $200 {
                iso3?: /**
                 * example:
                 * USD
                 */
                Components.Schemas.CurrencyIso3 /* ^[A-Z]+$ */;
            }
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $409 = Components.Responses.Conflict;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace BulkUpdateTransactionConfigs {
        namespace Parameters {
            /**
             * example:
             * bankwire
             */
            export type Code = string;
        }
        export interface PathParameters {
            code: /**
             * example:
             * bankwire
             */
            Parameters.Code;
        }
        export interface RequestBody {
            countryAuthorityMethods: [
                Components.Schemas.CountryAuthorityMethodDto,
                ...Components.Schemas.CountryAuthorityMethodDto[]
            ];
            currencyConfigs: Components.Schemas.CurrencyConfigsUpdateDto;
        }
        namespace Responses {
            export type $204 = Components.Responses.NoContent;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.MaxAllowedCurrenciesExceededError;
            export type $422 = Components.Responses.ValidationError;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace CreateCountryAuthority {
        export type RequestBody = Components.Schemas.CountryAuthorityDto;
        namespace Responses {
            export type $200 = Components.Schemas.CountryAuthorityDto;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.Conflict;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace ExportLimits {
        namespace Responses {
            export type $200 = string;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetConfigs {
        namespace Parameters {
            export type $0 = Components.Parameters.AuthorityHeader;
            export type $1 = Components.Parameters.CountryHeader;
        }
        namespace Responses {
            export type $200 = Components.Schemas.PaymentsConfig[];
            export type $400 = Components.Responses.BadRequest;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetCountries {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type ProviderCode = string;
        }
        export interface QueryParameters {
            authority?: Parameters.Authority;
            providerCode?: Parameters.ProviderCode;
        }
        namespace Responses {
            export interface $200 {
                countries?: Components.Schemas.CountryConfig[];
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetCountryAuthorityMethods {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
        }
        export interface QueryParameters {
            authority: Parameters.Authority;
            country: Parameters.Country;
        }
        namespace Responses {
            export interface $200 {
                paymentMethodConfigs?: Components.Schemas.PaymentMethodConfig[];
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetCurrencies {
        namespace Responses {
            export type $200 = string[];
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetDepositConfigs {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
            export type Platform = string;
            export type Version = string;
        }
        export interface QueryParameters {
            authority: Parameters.Authority;
            country: Parameters.Country;
            platform?: Parameters.Platform;
            version?: Parameters.Version;
        }
        namespace Responses {
            export type $200 = Components.Schemas.PaymentsDepositConfig[];
            export type $400 = Components.Responses.BadRequest;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetInteropStpProviderRules {
        namespace Parameters {
            export type $0 = Components.Parameters.AuthorityHeader;
            export type $1 = Components.Parameters.ProviderCodeHeader;
        }
        namespace Responses {
            export type $200 = Components.Schemas.InteropStpProviderRule[];
            export type $400 = Components.Responses.BadRequest;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetMethods {
        namespace Responses {
            export interface $200 {
                methods?: Components.Schemas.MethodDto[];
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetPlatformVersions {
        namespace Responses {
            export type $200 = Components.Schemas.PlatformVersions;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetProviderBankAccounts {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        namespace Responses {
            export interface $200 {
                schema?: {
                    [key: string]: any;
                };
                bankAccountsData?: Components.Schemas.BankAccountData;
            }
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetProviderBoundedMethods {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        export interface RequestBody {
            countriesAuthorities?: [
                Components.Schemas.CountryAuthorityDto,
                ...Components.Schemas.CountryAuthorityDto[]
            ];
        }
        namespace Responses {
            export type $200 = Components.Schemas.ProviderMethodBoundedDto[];
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetProviderCredentials {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        namespace Responses {
            export interface $200 {
                schema?: {
                    [key: string]: any;
                };
                credentialsData?: Components.Schemas.CredentialsGroupData;
            }
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetProviderFields {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ProviderFields;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetProviderMethodConfigs {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
            export type MethodCode = Components.Schemas.MethodCode;
        }
        export interface PathParameters {
            methodCode: Parameters.MethodCode;
        }
        export interface QueryParameters {
            authority: Parameters.Authority;
            country: Parameters.Country;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ProviderConfig[];
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetProviderRestrictions {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ProviderRestrictions;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
        }
    }
    namespace GetProviderSettings {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ProviderSettings;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetProviders {
        namespace Responses {
            export type $200 = Components.Schemas.ProviderBase[];
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetStpProviderRules {
        namespace Parameters {
            /**
             * example:
             * bankwire
             */
            export type Code = string;
        }
        export interface PathParameters {
            code: /**
             * example:
             * bankwire
             */
            Parameters.Code;
        }
        namespace Responses {
            export type $200 = Components.Schemas.StpProviderRulesDto[];
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetStpRules {
        namespace Responses {
            export type $200 = Components.Schemas.StpRule[];
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace GetWithdrawalsOrder {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
        }
        export interface QueryParameters {
            authority: Parameters.Authority;
            country: Parameters.Country;
        }
        namespace Responses {
            export type $200 = Components.Schemas.WithdrawalsOrder;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace SyncPlatformVersions {
        namespace Responses {
            export type $200 = Components.Schemas.SyncResponse;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateCountryAuthorityMethodStatus {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
            export type MethodCode = Components.Schemas.MethodCode;
        }
        export interface PathParameters {
            methodCode: Parameters.MethodCode;
        }
        export interface QueryParameters {
            authority: Parameters.Authority;
            country: Parameters.Country;
        }
        export type RequestBody = Components.RequestBodies.UpdateCountryAuthorityMethodStatus;
        namespace Responses {
            export interface $200 {
                isEnabled?: boolean;
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateCountryAuthorityMethodsOrder {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
        }
        export interface QueryParameters {
            country: Parameters.Country;
            authority: Parameters.Authority;
        }
        export interface RequestBody {
            methodCodes: string[];
        }
        namespace Responses {
            export interface $200 {
                methodCodes: string[];
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.Conflict;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateMethod {
        export type RequestBody = Components.Schemas.MethodDto;
        namespace Responses {
            export type $200 = Components.Schemas.MethodDto;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateProvider {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        export interface RequestBody {
            /**
             * example:
             * true
             */
            isEnabled: boolean;
        }
        namespace Responses {
            export type $200 = Components.Schemas.Provider;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateProviderBankAccounts {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        export interface RequestBody {
            bankAccountsData: Components.Schemas.BankAccountUpdateData;
        }
        namespace Responses {
            export interface $200 {
                schema?: {
                    [key: string]: any;
                };
                bankAccountsData?: Components.Schemas.BankAccountData;
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.CredentialsOverlapError;
            export type $413 = Components.Responses.ContentTooLarge;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateProviderCredentials {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        export interface RequestBody {
            credentialsData: Components.Schemas.CredentialsGroupDataUpdate;
        }
        namespace Responses {
            export interface $200 {
                schema?: {
                    [key: string]: any;
                };
                credentialsData: Components.Schemas.CredentialsGroupData;
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.CredentialsOverlapError;
            export type $413 = Components.Responses.ContentTooLarge;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateProviderMethodConfigs {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
            export type MethodCode = Components.Schemas.MethodCode;
        }
        export interface PathParameters {
            methodCode: Parameters.MethodCode;
        }
        export interface QueryParameters {
            authority: Parameters.Authority;
            country: Parameters.Country;
        }
        export type RequestBody = Components.RequestBodies.UpdateProviderMethodConfigs;
        namespace Responses {
            export type $200 = Components.Schemas.ProviderConfig[];
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $422 = Components.Responses.ValidationError;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateProviderRestrictions {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        export type RequestBody = Components.Schemas.ProviderRestrictions;
        namespace Responses {
            export type $200 = Components.Schemas.ProviderRestrictions;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.CredentialsOverlapError;
        }
    }
    namespace UpdateProviderSettings {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        export type RequestBody = Components.Schemas.ProviderSettings;
        namespace Responses {
            export type $200 = Components.Schemas.ProviderSettings;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.Conflict;
            export type $422 = Components.Responses.ValidationError;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateStpProviderRules {
        namespace Parameters {
            /**
             * example:
             * bankwire
             */
            export type Code = string;
        }
        export interface PathParameters {
            code: /**
             * example:
             * bankwire
             */
            Parameters.Code;
        }
        export type RequestBody = Components.Schemas.StpProviderRulesDto[];
        namespace Responses {
            export type $200 = Components.Schemas.StpProviderRulesDto[];
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.Conflict;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpdateWithdrawalsOrder {
        namespace Parameters {
            export type Authority = /**
             * example:
             * FSCM
             */
            Components.Schemas.Authority;
            export type Country = /**
             * example:
             * CY
             */
            Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
        }
        export interface QueryParameters {
            authority: Parameters.Authority;
            country: Parameters.Country;
        }
        export type RequestBody = Components.Schemas.WithdrawalsOrder;
        namespace Responses {
            export type $200 = Components.Schemas.WithdrawalsOrder;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.Conflict;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpsertConfig {
        export interface RequestBody {
            provider: {
                /**
                 * example:
                 * Stripe
                 */
                name: string;
                /**
                 * example:
                 * stripe
                 */
                code: string; // ^[A-Za-z0-9_]+$
            };
            countryAuthorityMethods: Components.Schemas.CountryAuthorityMethodDto[];
        }
        namespace Responses {
            export interface $200 {
                provider?: {
                    /**
                     * example:
                     * Stripe
                     */
                    name?: string;
                    /**
                     * example:
                     * stripe
                     */
                    code?: string;
                };
                countryAuthorityMethods?: {
                    country?: /**
                     * example:
                     * CY
                     */
                    Components.Schemas.CountryIso2 /* ^[A-Za-z]{2}$ */;
                    authority?: /**
                     * example:
                     * FSCM
                     */
                    Components.Schemas.Authority;
                    /**
                     * example:
                     * Visa/Mastercard
                     */
                    methodName?: string;
                    /**
                     * example:
                     * cards
                     */
                    methodCode?: string;
                    isEnabled?: boolean;
                }[];
            }
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.Conflict;
            export type $500 = Components.Responses.ServerError;
        }
    }
    namespace UpsertProviderFields {
        namespace Parameters {
            export type Code = string;
        }
        export interface PathParameters {
            code: Parameters.Code;
        }
        export interface RequestBody {
            specific: {
                parameters: {
                    countriesAuthorities: [
                        Components.Schemas.CountryAuthorityDto,
                        ...Components.Schemas.CountryAuthorityDto[]
                    ];
                    currencies: string[];
                };
                fields: Components.Schemas.Field[];
            }[];
            common: Components.Schemas.Field[];
        }
        namespace Responses {
            export type $200 = Components.Schemas.ProviderFields;
            export type $400 = Components.Responses.BadRequest;
            export type $401 = Components.Responses.Unauthorized;
            export type $403 = Components.Responses.Forbidden;
            export type $404 = Components.Responses.NotFound;
            export type $409 = Components.Responses.Conflict;
            export type $422 = Components.Responses.Validation;
            export type $500 = Components.Responses.ServerError;
        }
    }
}

export interface OperationMethods {
  /**
   * getDepositConfigs - Retrieve Legacy AdminAPI Contract for Deposit Payment Method Configurations
   * 
   * This endpoint returns the legacy AdminAPI contract for deposit payment method configurations. It provides a list of settings and details related to deposit options.
   */
  'getDepositConfigs'(
    parameters?: Parameters<Paths.GetDepositConfigs.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetDepositConfigs.Responses.$200>
  /**
   * getConfigs - Retrieve Legacy AdminAPI Contract for Deposit/Payout/Refund Payment Method Configurations
   * 
   * This endpoint returns the legacy AdminAPI contract for deposit/payout/refund payment method configurations. It provides a list of settings and details related to deposit options.
   */
  'getConfigs'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetConfigs.Responses.$200>
  /**
   * getInteropStpProviderRules - Retrieve Legacy AdminAPI Contract STP rules of specific Provider
   * 
   * This endpoint returns a list of STP rules of specific Provider.
   */
  'getInteropStpProviderRules'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetInteropStpProviderRules.Responses.$200>
  /**
   * getCountries - Get country configs
   * 
   * Returns an array of country configs for countries from all or specified authority
   */
  'getCountries'(
    parameters?: Parameters<Paths.GetCountries.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCountries.Responses.$200>
  /**
   * addCountry - Add a new country
   * 
   * Add a new country to the database
   */
  'addCountry'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AddCountry.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddCountry.Responses.$200>
  /**
   * getCurrencies - Get all available currencies
   * 
   * Returns an array of all ISO-3 currency codes
   */
  'getCurrencies'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCurrencies.Responses.$200>
  /**
   * addCurrency - Create a new currency
   * 
   * This endpoint allows you to add a new currency to the system. Upon successful addition, it returns the ISO-3 currency code of the newly added currency.
   */
  'addCurrency'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.AddCurrency.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.AddCurrency.Responses.$200>
  /**
   * getStpRules - Get all available STP rules
   * 
   * Returns a reference dictionary list of all STP rules in the system
   */
  'getStpRules'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetStpRules.Responses.$200>
  /**
   * exportLimits - Export Transaction Configurations to CSV
   * 
   * This endpoint generates a CSV file containing transaction configurations for statistics by limits. The CSV file can be downloaded and contains data such as transaction details, limits, and other relevant information.
   * 
   * ### Response
   * The response will be a CSV file with the specified filename in the `Content-Disposition` header. The file can be downloaded by the client.
   * 
   */
  'exportLimits'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.ExportLimits.Responses.$200>
  /**
   * getProviders - Get all available providers
   * 
   * Returns an array of all provider codes and names
   */
  'getProviders'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviders.Responses.$200>
  /**
   * updateProvider - Partially update provider by code
   * 
   * This endpoint allows you to apply partial updates to a provider by specifying its unique code. It updates the provider and returns the modified entity, reflecting only the changes provided in the request.
   */
  'updateProvider'(
    parameters?: Parameters<Paths.UpdateProvider.PathParameters> | null,
    data?: Paths.UpdateProvider.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProvider.Responses.$200>
  /**
   * getStpProviderRules - Retrieve stp rules configuration for a particular provider
   * 
   * Retrieves the configuration of Straight-Through Processing (STP) rules for a specific provider identified by the `code` parameter. STP rules define the automated processing logic for handling transactions without manual intervention.
   * 
   */
  'getStpProviderRules'(
    parameters?: Parameters<Paths.GetStpProviderRules.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetStpProviderRules.Responses.$200>
  /**
   * updateStpProviderRules - Update the STP rules configuration for a particular provider
   * 
   * Updates the configuration of Straight-Through Processing (STP) rules for a specific provider identified by the code parameter. STP rules define the automated processing logic for handling transactions without manual intervention.
   * 
   */
  'updateStpProviderRules'(
    parameters?: Parameters<Paths.UpdateStpProviderRules.PathParameters> | null,
    data?: Paths.UpdateStpProviderRules.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateStpProviderRules.Responses.$200>
  /**
   * getProviderBankAccounts - Get all bank accounts
   * 
   * Returns bank accounts by provider code
   */
  'getProviderBankAccounts'(
    parameters?: Parameters<Paths.GetProviderBankAccounts.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderBankAccounts.Responses.$200>
  /**
   * updateProviderBankAccounts - Update bank accounts
   * 
   * Update and return all bank accounts
   */
  'updateProviderBankAccounts'(
    parameters?: Parameters<Paths.UpdateProviderBankAccounts.PathParameters> | null,
    data?: Paths.UpdateProviderBankAccounts.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProviderBankAccounts.Responses.$200>
  /**
   * bulkUpdateTransactionConfigs - Update transaction-configs in mapped country-authorities
   * 
   * Partial update of transaction-configs in mapped country-authorities
   */
  'bulkUpdateTransactionConfigs'(
    parameters?: Parameters<Paths.BulkUpdateTransactionConfigs.PathParameters> | null,
    data?: Paths.BulkUpdateTransactionConfigs.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.BulkUpdateTransactionConfigs.Responses.$204>
  /**
   * getProviderCredentials - Get all credentials
   * 
   * Returns credentials
   */
  'getProviderCredentials'(
    parameters?: Parameters<Paths.GetProviderCredentials.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderCredentials.Responses.$200>
  /**
   * updateProviderCredentials - Update credentials
   * 
   * Update and return all credentials
   */
  'updateProviderCredentials'(
    parameters?: Parameters<Paths.UpdateProviderCredentials.PathParameters> | null,
    data?: Paths.UpdateProviderCredentials.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProviderCredentials.Responses.$200>
  /**
   * getProviderBoundedMethods - Get payment methods with state by provider
   * 
   * Returns methods with state by provider code
   */
  'getProviderBoundedMethods'(
    parameters?: Parameters<Paths.GetProviderBoundedMethods.PathParameters> | null,
    data?: Paths.GetProviderBoundedMethods.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderBoundedMethods.Responses.$200>
  /**
   * getProviderFields - Get provider fields
   * 
   * Return fields with options for specific provider
   */
  'getProviderFields'(
    parameters?: Parameters<Paths.GetProviderFields.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderFields.Responses.$200>
  /**
   * upsertProviderFields - Upsert fields
   * 
   * Upsert Fields and FieldOptions for specific provider
   */
  'upsertProviderFields'(
    parameters?: Parameters<Paths.UpsertProviderFields.PathParameters> | null,
    data?: Paths.UpsertProviderFields.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpsertProviderFields.Responses.$200>
  /**
   * getProviderRestrictions - Get provider platform versions
   * 
   * Returns provider platform versions restrictions
   */
  'getProviderRestrictions'(
    parameters?: Parameters<Paths.GetProviderRestrictions.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderRestrictions.Responses.$200>
  /**
   * updateProviderRestrictions - Update provider restrictions
   * 
   * Update provider restrictions for mobile platforms
   */
  'updateProviderRestrictions'(
    parameters?: Parameters<Paths.UpdateProviderRestrictions.PathParameters> | null,
    data?: Paths.UpdateProviderRestrictions.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProviderRestrictions.Responses.$200>
  /**
   * getWithdrawalsOrder - Get Provider Methods sorted by order
   * 
   * The endpoint returns enabled ProviderMethods for payouts and refunds in a selected authority and country in the DESC order according to the payoutOrder and refundOrder
   * 
   */
  'getWithdrawalsOrder'(
    parameters?: Parameters<Paths.GetWithdrawalsOrder.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetWithdrawalsOrder.Responses.$200>
  /**
   * updateWithdrawalsOrder - Update Provider Methods withdrawals order
   * 
   * The endpoint updates refunds and payout order values and enabled ProviderMethods for payouts and refunds in a selected authority and country in the DESC order after update
   * 
   */
  'updateWithdrawalsOrder'(
    parameters?: Parameters<Paths.UpdateWithdrawalsOrder.QueryParameters> | null,
    data?: Paths.UpdateWithdrawalsOrder.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateWithdrawalsOrder.Responses.$200>
  /**
   * createCountryAuthority - Create country authority
   * 
   * This endpoint creates a new country authority. Once created, it returns the details of the new country authority.
   */
  'createCountryAuthority'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.CreateCountryAuthority.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateCountryAuthority.Responses.$200>
  /**
   * getCountryAuthorityMethods - Get payment method configs
   * 
   * Returns an array of CountryAuthorityMethods with provider names by authority name and country ISO-2
   */
  'getCountryAuthorityMethods'(
    parameters?: Parameters<Paths.GetCountryAuthorityMethods.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetCountryAuthorityMethods.Responses.$200>
  /**
   * updateCountryAuthorityMethodStatus - Update payment method status
   * 
   * Updates payment method status value by its code for specified authority name and country ISO-2
   */
  'updateCountryAuthorityMethodStatus'(
    parameters?: Parameters<Paths.UpdateCountryAuthorityMethodStatus.PathParameters & Paths.UpdateCountryAuthorityMethodStatus.QueryParameters> | null,
    data?: Paths.UpdateCountryAuthorityMethodStatus.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateCountryAuthorityMethodStatus.Responses.$200>
  /**
   * updateCountryAuthorityMethodsOrder - Update order of CountryAuthorityMethods
   * 
   * Update order of CountryAuthorityMethods for deposits
   */
  'updateCountryAuthorityMethodsOrder'(
    parameters?: Parameters<Paths.UpdateCountryAuthorityMethodsOrder.QueryParameters> | null,
    data?: Paths.UpdateCountryAuthorityMethodsOrder.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateCountryAuthorityMethodsOrder.Responses.$200>
  /**
   * getProviderMethodConfigs - Get provider configs for payment method
   * 
   * Returns an array of provider configs for method by its code with specified authority name and country ISO-2
   */
  'getProviderMethodConfigs'(
    parameters?: Parameters<Paths.GetProviderMethodConfigs.PathParameters & Paths.GetProviderMethodConfigs.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderMethodConfigs.Responses.$200>
  /**
   * updateProviderMethodConfigs - Update provider configs for payment method
   * 
   * Update providers method status and its transaction configs
   */
  'updateProviderMethodConfigs'(
    parameters?: Parameters<Paths.UpdateProviderMethodConfigs.PathParameters & Paths.UpdateProviderMethodConfigs.QueryParameters> | null,
    data?: Paths.UpdateProviderMethodConfigs.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProviderMethodConfigs.Responses.$200>
  /**
   * upsertConfig - Upsert config
   * 
   * Create or Update Provider and map it to specific country-authority-method groups
   */
  'upsertConfig'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpsertConfig.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpsertConfig.Responses.$200>
  /**
   * getPlatformVersions - Get all versions for platforms
   * 
   * Returns available application version tags for different platforms
   */
  'getPlatformVersions'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetPlatformVersions.Responses.$200>
  /**
   * syncPlatformVersions - Sync platform versions
   * 
   * Returns response with status
   */
  'syncPlatformVersions'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.SyncPlatformVersions.Responses.$200>
  /**
   * getProviderSettings - Get Provider related settings
   * 
   * Get provider related settings
   */
  'getProviderSettings'(
    parameters?: Parameters<Paths.GetProviderSettings.PathParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetProviderSettings.Responses.$200>
  /**
   * updateProviderSettings - Update Provider related settings
   * 
   * Update provider related settings
   */
  'updateProviderSettings'(
    parameters?: Parameters<Paths.UpdateProviderSettings.PathParameters> | null,
    data?: Paths.UpdateProviderSettings.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateProviderSettings.Responses.$200>
  /**
   * getMethods - Get Methods
   * 
   * Get Methods
   */
  'getMethods'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.GetMethods.Responses.$200>
  /**
   * updateMethod - Put Method
   * 
   * Create or update a Method
   */
  'updateMethod'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: Paths.UpdateMethod.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.UpdateMethod.Responses.$200>
}

export interface PathsDictionary {
  ['/api/interop/configs/deposits']: {
    /**
     * getDepositConfigs - Retrieve Legacy AdminAPI Contract for Deposit Payment Method Configurations
     * 
     * This endpoint returns the legacy AdminAPI contract for deposit payment method configurations. It provides a list of settings and details related to deposit options.
     */
    'get'(
      parameters?: Parameters<Paths.GetDepositConfigs.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetDepositConfigs.Responses.$200>
  }
  ['/api/interop/configs']: {
    /**
     * getConfigs - Retrieve Legacy AdminAPI Contract for Deposit/Payout/Refund Payment Method Configurations
     * 
     * This endpoint returns the legacy AdminAPI contract for deposit/payout/refund payment method configurations. It provides a list of settings and details related to deposit options.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetConfigs.Responses.$200>
  }
  ['/api/interop/stp-rules']: {
    /**
     * getInteropStpProviderRules - Retrieve Legacy AdminAPI Contract STP rules of specific Provider
     * 
     * This endpoint returns a list of STP rules of specific Provider.
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetInteropStpProviderRules.Responses.$200>
  }
  ['/api/countries']: {
    /**
     * getCountries - Get country configs
     * 
     * Returns an array of country configs for countries from all or specified authority
     */
    'get'(
      parameters?: Parameters<Paths.GetCountries.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCountries.Responses.$200>
    /**
     * addCountry - Add a new country
     * 
     * Add a new country to the database
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AddCountry.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddCountry.Responses.$200>
  }
  ['/api/currencies']: {
    /**
     * addCurrency - Create a new currency
     * 
     * This endpoint allows you to add a new currency to the system. Upon successful addition, it returns the ISO-3 currency code of the newly added currency.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.AddCurrency.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.AddCurrency.Responses.$200>
    /**
     * getCurrencies - Get all available currencies
     * 
     * Returns an array of all ISO-3 currency codes
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCurrencies.Responses.$200>
  }
  ['/api/stp-rules']: {
    /**
     * getStpRules - Get all available STP rules
     * 
     * Returns a reference dictionary list of all STP rules in the system
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetStpRules.Responses.$200>
  }
  ['/api/provider-methods/transaction-configs/export']: {
    /**
     * exportLimits - Export Transaction Configurations to CSV
     * 
     * This endpoint generates a CSV file containing transaction configurations for statistics by limits. The CSV file can be downloaded and contains data such as transaction details, limits, and other relevant information.
     * 
     * ### Response
     * The response will be a CSV file with the specified filename in the `Content-Disposition` header. The file can be downloaded by the client.
     * 
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.ExportLimits.Responses.$200>
  }
  ['/api/providers']: {
    /**
     * getProviders - Get all available providers
     * 
     * Returns an array of all provider codes and names
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviders.Responses.$200>
  }
  ['/api/providers/{code}']: {
    /**
     * updateProvider - Partially update provider by code
     * 
     * This endpoint allows you to apply partial updates to a provider by specifying its unique code. It updates the provider and returns the modified entity, reflecting only the changes provided in the request.
     */
    'patch'(
      parameters?: Parameters<Paths.UpdateProvider.PathParameters> | null,
      data?: Paths.UpdateProvider.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProvider.Responses.$200>
  }
  ['/api/providers/{code}/stp-rules']: {
    /**
     * getStpProviderRules - Retrieve stp rules configuration for a particular provider
     * 
     * Retrieves the configuration of Straight-Through Processing (STP) rules for a specific provider identified by the `code` parameter. STP rules define the automated processing logic for handling transactions without manual intervention.
     * 
     */
    'get'(
      parameters?: Parameters<Paths.GetStpProviderRules.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetStpProviderRules.Responses.$200>
    /**
     * updateStpProviderRules - Update the STP rules configuration for a particular provider
     * 
     * Updates the configuration of Straight-Through Processing (STP) rules for a specific provider identified by the code parameter. STP rules define the automated processing logic for handling transactions without manual intervention.
     * 
     */
    'put'(
      parameters?: Parameters<Paths.UpdateStpProviderRules.PathParameters> | null,
      data?: Paths.UpdateStpProviderRules.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateStpProviderRules.Responses.$200>
  }
  ['/api/providers/{code}/bank-accounts']: {
    /**
     * getProviderBankAccounts - Get all bank accounts
     * 
     * Returns bank accounts by provider code
     */
    'get'(
      parameters?: Parameters<Paths.GetProviderBankAccounts.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderBankAccounts.Responses.$200>
    /**
     * updateProviderBankAccounts - Update bank accounts
     * 
     * Update and return all bank accounts
     */
    'put'(
      parameters?: Parameters<Paths.UpdateProviderBankAccounts.PathParameters> | null,
      data?: Paths.UpdateProviderBankAccounts.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProviderBankAccounts.Responses.$200>
  }
  ['/api/providers/{code}/transaction-configs/bulk-update']: {
    /**
     * bulkUpdateTransactionConfigs - Update transaction-configs in mapped country-authorities
     * 
     * Partial update of transaction-configs in mapped country-authorities
     */
    'patch'(
      parameters?: Parameters<Paths.BulkUpdateTransactionConfigs.PathParameters> | null,
      data?: Paths.BulkUpdateTransactionConfigs.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.BulkUpdateTransactionConfigs.Responses.$204>
  }
  ['/api/providers/{code}/credentials']: {
    /**
     * updateProviderCredentials - Update credentials
     * 
     * Update and return all credentials
     */
    'put'(
      parameters?: Parameters<Paths.UpdateProviderCredentials.PathParameters> | null,
      data?: Paths.UpdateProviderCredentials.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProviderCredentials.Responses.$200>
    /**
     * getProviderCredentials - Get all credentials
     * 
     * Returns credentials
     */
    'get'(
      parameters?: Parameters<Paths.GetProviderCredentials.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderCredentials.Responses.$200>
  }
  ['/api/providers/{code}/methods/filter']: {
    /**
     * getProviderBoundedMethods - Get payment methods with state by provider
     * 
     * Returns methods with state by provider code
     */
    'post'(
      parameters?: Parameters<Paths.GetProviderBoundedMethods.PathParameters> | null,
      data?: Paths.GetProviderBoundedMethods.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderBoundedMethods.Responses.$200>
  }
  ['/api/providers/{code}/fields']: {
    /**
     * getProviderFields - Get provider fields
     * 
     * Return fields with options for specific provider
     */
    'get'(
      parameters?: Parameters<Paths.GetProviderFields.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderFields.Responses.$200>
  }
  ['/api/providers/{code}/fields/bulk-update']: {
    /**
     * upsertProviderFields - Upsert fields
     * 
     * Upsert Fields and FieldOptions for specific provider
     */
    'put'(
      parameters?: Parameters<Paths.UpsertProviderFields.PathParameters> | null,
      data?: Paths.UpsertProviderFields.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpsertProviderFields.Responses.$200>
  }
  ['/api/providers/{code}/restrictions']: {
    /**
     * getProviderRestrictions - Get provider platform versions
     * 
     * Returns provider platform versions restrictions
     */
    'get'(
      parameters?: Parameters<Paths.GetProviderRestrictions.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderRestrictions.Responses.$200>
    /**
     * updateProviderRestrictions - Update provider restrictions
     * 
     * Update provider restrictions for mobile platforms
     */
    'put'(
      parameters?: Parameters<Paths.UpdateProviderRestrictions.PathParameters> | null,
      data?: Paths.UpdateProviderRestrictions.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProviderRestrictions.Responses.$200>
  }
  ['/api/provider-methods/withdrawals-order']: {
    /**
     * getWithdrawalsOrder - Get Provider Methods sorted by order
     * 
     * The endpoint returns enabled ProviderMethods for payouts and refunds in a selected authority and country in the DESC order according to the payoutOrder and refundOrder
     * 
     */
    'get'(
      parameters?: Parameters<Paths.GetWithdrawalsOrder.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetWithdrawalsOrder.Responses.$200>
    /**
     * updateWithdrawalsOrder - Update Provider Methods withdrawals order
     * 
     * The endpoint updates refunds and payout order values and enabled ProviderMethods for payouts and refunds in a selected authority and country in the DESC order after update
     * 
     */
    'put'(
      parameters?: Parameters<Paths.UpdateWithdrawalsOrder.QueryParameters> | null,
      data?: Paths.UpdateWithdrawalsOrder.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateWithdrawalsOrder.Responses.$200>
  }
  ['/api/country-authority']: {
    /**
     * createCountryAuthority - Create country authority
     * 
     * This endpoint creates a new country authority. Once created, it returns the details of the new country authority.
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.CreateCountryAuthority.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateCountryAuthority.Responses.$200>
  }
  ['/api/country-authority-methods']: {
    /**
     * getCountryAuthorityMethods - Get payment method configs
     * 
     * Returns an array of CountryAuthorityMethods with provider names by authority name and country ISO-2
     */
    'get'(
      parameters?: Parameters<Paths.GetCountryAuthorityMethods.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetCountryAuthorityMethods.Responses.$200>
  }
  ['/api/country-authority-methods/{methodCode}/status']: {
    /**
     * updateCountryAuthorityMethodStatus - Update payment method status
     * 
     * Updates payment method status value by its code for specified authority name and country ISO-2
     */
    'put'(
      parameters?: Parameters<Paths.UpdateCountryAuthorityMethodStatus.PathParameters & Paths.UpdateCountryAuthorityMethodStatus.QueryParameters> | null,
      data?: Paths.UpdateCountryAuthorityMethodStatus.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateCountryAuthorityMethodStatus.Responses.$200>
  }
  ['/api/country-authority-methods/order']: {
    /**
     * updateCountryAuthorityMethodsOrder - Update order of CountryAuthorityMethods
     * 
     * Update order of CountryAuthorityMethods for deposits
     */
    'put'(
      parameters?: Parameters<Paths.UpdateCountryAuthorityMethodsOrder.QueryParameters> | null,
      data?: Paths.UpdateCountryAuthorityMethodsOrder.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateCountryAuthorityMethodsOrder.Responses.$200>
  }
  ['/api/country-authority-methods/{methodCode}/providers']: {
    /**
     * getProviderMethodConfigs - Get provider configs for payment method
     * 
     * Returns an array of provider configs for method by its code with specified authority name and country ISO-2
     */
    'get'(
      parameters?: Parameters<Paths.GetProviderMethodConfigs.PathParameters & Paths.GetProviderMethodConfigs.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderMethodConfigs.Responses.$200>
    /**
     * updateProviderMethodConfigs - Update provider configs for payment method
     * 
     * Update providers method status and its transaction configs
     */
    'put'(
      parameters?: Parameters<Paths.UpdateProviderMethodConfigs.PathParameters & Paths.UpdateProviderMethodConfigs.QueryParameters> | null,
      data?: Paths.UpdateProviderMethodConfigs.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProviderMethodConfigs.Responses.$200>
  }
  ['/api/config']: {
    /**
     * upsertConfig - Upsert config
     * 
     * Create or Update Provider and map it to specific country-authority-method groups
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpsertConfig.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpsertConfig.Responses.$200>
  }
  ['/api/platform-versions']: {
    /**
     * getPlatformVersions - Get all versions for platforms
     * 
     * Returns available application version tags for different platforms
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetPlatformVersions.Responses.$200>
  }
  ['/api/platform-versions/sync']: {
    /**
     * syncPlatformVersions - Sync platform versions
     * 
     * Returns response with status
     */
    'post'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.SyncPlatformVersions.Responses.$200>
  }
  ['/api/providers/{code}/settings']: {
    /**
     * getProviderSettings - Get Provider related settings
     * 
     * Get provider related settings
     */
    'get'(
      parameters?: Parameters<Paths.GetProviderSettings.PathParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetProviderSettings.Responses.$200>
    /**
     * updateProviderSettings - Update Provider related settings
     * 
     * Update provider related settings
     */
    'put'(
      parameters?: Parameters<Paths.UpdateProviderSettings.PathParameters> | null,
      data?: Paths.UpdateProviderSettings.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateProviderSettings.Responses.$200>
  }
  ['/api/methods']: {
    /**
     * getMethods - Get Methods
     * 
     * Get Methods
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.GetMethods.Responses.$200>
    /**
     * updateMethod - Put Method
     * 
     * Create or update a Method
     */
    'put'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: Paths.UpdateMethod.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.UpdateMethod.Responses.$200>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>
