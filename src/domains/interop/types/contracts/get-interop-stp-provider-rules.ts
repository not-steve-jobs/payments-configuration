export interface StpProviderRuleInterop {
  id: number;
  key: string;
  description: string;
  allowType: number | null;
  valueType: string | null;
  value: string | string[] | null;
  enforceAuto: null;
  isEnabled: boolean;
  orderId: number;
}

export interface GetInteropStpRulesParams {
  providerCode: string;
  authority: string;
}
