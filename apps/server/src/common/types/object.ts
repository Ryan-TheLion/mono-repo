export type RequiredKeys<T extends Record<any, any>> = {
  [K in keyof T]-?: Pick<T, K> extends Required<Pick<T, K>> ? K : never;
}[keyof T];

export type OptionalKeys<T extends Record<any, any>> = {
  [K in keyof T]-?: Pick<T, K> extends Required<Pick<T, K>> ? never : K;
}[keyof T];

export type FlattenRecordValues<T> =
  T extends Record<any, infer V> ? FlattenRecordValues<V> : T;
