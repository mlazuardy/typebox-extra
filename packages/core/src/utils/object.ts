type ObjectFields<T, K extends keyof T> = K | K[];

export function objectOnly<T extends object = any, K extends keyof T = any>(
  data: T,
  fields: ObjectFields<T, K>,
) {
  const keys = typeof fields === "string" ? [fields] : (fields as string[]);

  return keys
    .map((k) => (k in data ? { [k]: data[k] } : {}))
    .reduce((res: any, o) => Object.assign(res, o), {});
}

export function objectExcept<T extends object = any, K extends keyof T = any>(
  data: T,
  fields: ObjectFields<T, K>,
) {
  const keys = typeof fields === "string" ? [fields] : (fields as string[]);

  const vkeys = Object.keys(data).filter((k) => !keys.includes(k));

  return objectOnly(data, vkeys as any);
}
