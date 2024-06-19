import { ProviderMethodDefaultCurrency } from '@core';
import { parseJSONSafe } from '@utils';

export const getDefaultCurrency = (defaultCurrency: string | null): string | null => {
  if (!defaultCurrency) {
    return null;
  }

  const value = parseJSONSafe<ProviderMethodDefaultCurrency>(defaultCurrency, null);
  const valueToReturn = value && value.isEnabled ? value.currency : null;

  return valueToReturn ?? null;
};
