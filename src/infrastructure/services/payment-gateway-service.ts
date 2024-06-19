import { PaymentGatewayConfig } from '@core';
import { FaultTolerantRequestApi } from '@internal/request-library';

interface PSPGatewayServiceOptions {
  config: PaymentGatewayConfig;
  faultTolerantRequestApi: FaultTolerantRequestApi;
}

export interface PspCredentialsResponse {
  credentialsData: PspCredentialsData[];
}

export interface PspCredentialsData {
  parameters: Partial<PspCredentialsParameters>;
  credentialsDetails: Record<string, string>;
}

export interface PspCredentialsParameters {
  country: string;
  authority: string;
  currency: string;
}

export class PaymentGatewayService {
  private readonly config: PaymentGatewayConfig;
  private readonly requestApi: FaultTolerantRequestApi;

  constructor({ config = {}, faultTolerantRequestApi }: PSPGatewayServiceOptions) {
    this.config = config;
    this.requestApi = faultTolerantRequestApi;
  }

  public isEnabled(): boolean {
    return this.config?.enabled || false;
  }

  public async checkExistence(providerCode: string): Promise<boolean> {
    const url = `http://${this.config.host}/api/v1/credentials/${providerCode}/check-existence`;

    return await this.requestApi.get<boolean>(url);
  }

  public async getCredentialsSchema(providerCode: string): Promise<unknown> {
    const url = `http://${this.config.host}/api/v1/credentials/${providerCode}/schema`;
    return await this.requestApi.get<unknown>(url);
  }

  public async getCredentials(providerCode: string): Promise<PspCredentialsResponse> {
    const url = `http://${this.config.host}/api/v1/credentials/${providerCode}`;
    return await this.requestApi.get<PspCredentialsResponse>(url);
  }

  public async updateCredentials(providerCode: string, body: PspCredentialsResponse): Promise<void> {
    const url = `http://${this.config.host}/api/v1/credentials/${providerCode}`;

    return await this.requestApi.post(url, body);
  }
}
