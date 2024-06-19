export const disposer = (entity: { dispose(): Promise<void> }): Promise<void> => entity.dispose();

export function createUniqueHash<T>(object: T): string {
  return JSON.stringify(object);
}

export function objectToKey<T extends object>(object: T): string {
  const keys = Object.keys(object)
    .filter(key => typeof object[key as keyof T] !== 'function')
    .sort();

  return keys.map(key => `${key}=${object[key as keyof T]}`.toLowerCase()).join(':');
}

export function equalsIgnoringCase(s1: string, s2: string): boolean {
  return s1.toLowerCase() === s2.toLowerCase();
}

export function buildKey(...values: unknown[]): string {
  return values.join(':').toLowerCase();
}

export function groupBy<T, E>(elements: T[], cb: (element: T) => E): Map<E, T[]> {
  const groups = new Map<E, T[]>();

  for (const element of elements) {
    const groupKey = cb(element);
    const group = groups.get(groupKey) || [];
    group.push(element);
    groups.set(groupKey, group);
  }

  return groups;
}

export const parseJSONSafe = <T>(value: string, defaultValue: T | null = null): T | null => {
  try {
    if (typeof value !== 'string') {
      return defaultValue;
    }

    return JSON.parse(value);
  }
  catch (e) {
    return defaultValue;
  }
};

export const isDefaultCredentials = (credentials: Record<string, unknown> = {}): boolean => !Object.keys(credentials).length;
