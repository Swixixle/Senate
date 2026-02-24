// Canonical JSON serialization: stable, sorted keys, no whitespace
export function canonicalize(obj: any): string {
  function sortKeys(value: any): any {
    if (Array.isArray(value)) {
      return value.map(sortKeys);
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      return Object.keys(value)
        .sort()
        .reduce((acc, key) => {
          acc[key] = sortKeys(value[key]);
          return acc;
        }, {} as any);
    } else {
      return value;
    }
  }
  return JSON.stringify(sortKeys(obj));
}
