import { IConfig, ISharedConfig } from '@internal/core-library';
import { TransactionType } from '@core/contracts';

export interface PaymentMethodConfigFieldOption {
  key: string;
  description: string;
  enabled: boolean;
}

export interface PaymentMethodConfigField {
  key: string;
  value: string;
  type: string;
  description?: string;
  required?: boolean;
  validation?: string;
  adminApiId?: number;
  options?: PaymentMethodConfigFieldOption[];
}

export interface PaymentMethodTransactionConfig {
  enabled: boolean;
  fields: PaymentMethodConfigField[];
}

export interface PaymentMethodsConfig {
  [authority: string]: {
    [country: string]: {
      [currency: 'all' | string]: {
        [provider: string]: {
          [key in TransactionType]: PaymentMethodTransactionConfig;
        };
      };
    };
  };
}

export interface DirectAppConfig {
  mobileapp: {
    bitbucket: {
      android: {
        key: string;
        project: string;
      };
      ios: {
        key: string;
        project: string;
      };
      workspace: string;
    };
  };
}

export interface PaymentGatewayConfig {
  enabled?: boolean;
  host?: string;
}

export interface CacheConfig {
  redisKeyPrefix: string;
  enabled: boolean;
  ttlSeconds: number;
}

export interface AuthConfig {
  clientId: string;
  tenantId: string;
  apiKey: string;
}

export interface PaymentsConfigurationManagementServiceConfig extends IConfig, ISharedConfig {
  auth: AuthConfig;
  mssql: {
    database: string;
    host: string;
    port: number;
    user: string;
    password: string;
  };
  partnersapi: {
    host: string;
    authtoken: string;
    userid: string;
    getPaymentProviderEditConfig: string;
    setPaymentProviderEditConfig: string;
  };
  paymentMethods: PaymentMethodsConfig;
  direct: DirectAppConfig;
  paymentGateway: PaymentGatewayConfig;
  cache: CacheConfig;
  features?: {
    useNewFieldsSchema?: boolean;
  };
}
