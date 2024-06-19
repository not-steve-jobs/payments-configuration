export interface StpRuleDto {
  key: string;
  description: string | null;
  order: number;
  data: StpRuleData | null;
}

export interface StpRuleData {
  valueType: string;
  value: boolean | number | string | string[] | null;
}
