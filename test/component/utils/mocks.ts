import { clearAllMocks } from '@internal/component-test-library';

export async function setDefaultMocksState(): Promise<void> {
  clearAllMocks();
}
